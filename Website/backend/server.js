require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { handleBlockchainListing } = require('./blockchain/doc_functions');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB setup
let client, db, gfsBucket;
(async () => {
  try {
    client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
    await client.connect();
    db = client.db(process.env.DATABASE_NAME || 'EcoLedger');
    gfsBucket = new GridFSBucket(db, { bucketName: 'credits' });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
})();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Admin emails from .env
//const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

// User Validation Middleware
const validateUser = async (req, res, next) => {
  const email = req.headers['email'];
  if (!email) return res.status(400).json({ success: false, error: 'email_required' });
  
  const user = await db.collection('users').findOne({ email });
  if (!user) return res.status(404).json({ success: false, error: 'user_not_found' });

  // Add this debug log
  //console.log('Comparing:', email, 'with admin list:', ADMIN_EMAILS);
  
  // Case-sensitive comparison (change to .toLowerCase() if needed)
  //req.isAdmin = ADMIN_EMAILS.includes(email);
  req.user = user;
  
  // Debug log
  //console.log('Is admin?', req.isAdmin);
  
  next();
};

// Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'missing_fields',
        message: 'Email and name are required'
      });
    }

    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: 'user_exists',
        message: 'User already exists'
      });
    }

    await db.collection('users').insertOne({
      email,
      name,
      credits: [],
      createdAt: new Date()
    });

    res.status(201).json({ 
      success: true, 
      message: 'User created successfully'
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'server_error',
      message: 'Internal server error'
    });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'email_required',
        message: 'Email is required'
      });
    }

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'user_not_found',
        message: 'User not found'
      });
    }

    res.json({ 
      success: true,
      user: {
        email: user.email,
        name: user.name,
        credits: user.credits || []
      }
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'server_error',
      message: 'Internal server error'
    });
  }
});

// File Upload with GridFS
const storage = multer.memoryStorage();
const upload = multer({ storage });
////////////////////////////////////////////////////
app.post('/api/credits/upload', validateUser, upload.single('certificate'), async (req, res) => {
  let uploadStream;
  let mongoSuccess = false;
  let serial_number;

  try {
    // 1. Validate file
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'no_file',
        message: 'No file uploaded' 
      });
    }

    // 2. Authenticate with Flask
    const form = new FormData();
    form.append('certificate', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const flaskRes = await axios.post(
      'http://localhost:5001/api/credits/authenticate', 
      form, 
      { headers: form.getHeaders() }
    );

    serial_number = flaskRes.data.extracted_data.serial_number;
    if (!serial_number) throw new Error('No serial number extracted');

    // 3. Store in GridFS
    uploadStream = gfsBucket.openUploadStream(`${serial_number}.pdf`, {
      metadata: { 
        userId: req.user._id,
        email: req.user.email
      }
    });
    uploadStream.end(req.file.buffer);
    mongoSuccess = true;

    // 4. Update MongoDB
    await db.collection('credits').updateOne(
      { serialNumber: serial_number },
      { 
        $set: {
          fileId: uploadStream.id,
          userId: req.user._id,
          userEmail: req.user.email,
          status: 'authenticated'
        }
      },
      { upsert: true }
    );

    // 5. Update user's credits list
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $addToSet: { credits: serial_number } }
    );

    // 6. Return response
    res.status(201).json({
      success: true,
      serialNumber: serial_number,
      message: 'Certificate processed successfully',
      data: {
        mongoId: uploadStream.id,
        authentication: flaskRes.data
      }
    });

  } catch (err) {
    console.error('Upload processing error:', err);
    
    // Clean up GridFS if upload failed before completion
    if (uploadStream?.id && !mongoSuccess) {
      await gfsBucket.delete(uploadStream.id).catch(console.error);
    }

    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: err.message
    });
  }
});

// Marketplace listing endpoint
////////////////////////////////////////////
app.post('/api/marketplace/list', validateUser, async (req, res) => {
  try {
    const {
      fileHash,
      creditId,
      pricePerCredit,
      totalValue,
      ownershipType,
      ownerName,
      ownerEmail
    } = req.body;
    console.log('Incoming listing payload:', req.body);

    if (!fileHash || !pricePerCredit || !totalValue || !ownershipType || !ownerName || !ownerEmail) {
      return res.status(400).json({
        success: false,
        error: 'missing_fields',
        message: 'Required fields are missing'
      });
    }

    
    const credit= await db.collection('credits').findOne({ file_hash: fileHash });

    if (!credit) {
      return res.status(404).json({
        success: false,
        error: 'credit_not_found',
        message: 'Credit not found'
      });
    }

    // ✅ Properly update according to your schema
    await db.collection('credits').updateOne(
      { file_hash: fileHash },
      {
        $set: {
          status: 'listed',
          listedAt: new Date(),
          listingDetails: {
            pricePerCredit: parseFloat(pricePerCredit),
            totalValue: parseFloat(totalValue),
            ownership: {
              type: ownershipType,
              ownerName,
              ownerEmail
            }
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Credit listed successfully'
    });

  } catch (err) {
    console.error('Error in listing credit:', err);
    res.status(500).json({
      success: false,
      error: 'listing_failed',
      message: err.message
    });
  }
});

// Get marketplace listings (public endpoint)
app.get('/api/marketplace/listings', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, vintage, minPrice, maxPrice } = req.query;
    
    // Build filter query
    let filter = { status: 'active' };
    
    if (category) filter.category = category;
    if (vintage) filter.vintage = vintage;
    if (minPrice || maxPrice) {
      filter.pricePerCredit = {};
      if (minPrice) filter.pricePerCredit.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerCredit.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const listings = await db.collection('marketplace_listings')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('marketplace_listings').countDocuments(filter);

    res.json({
      success: true,
      listings: listings.map(listing => ({
        id: listing._id,
        serialNumber: listing.serialNumber,
        projectId: listing.projectId,
        projectName: listing.projectName,
        vintage: listing.vintage,
        amount: listing.amount,
        registry: listing.registry,
        category: listing.category,
        pricePerCredit: listing.pricePerCredit,
        totalValue: listing.totalValue,
        description: listing.description,
        sellerName: listing.sellerName,
        createdAt: listing.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    console.error('Marketplace listings fetch error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'fetch_failed',
      message: 'Failed to fetch marketplace listings'
    });
  }
});

/////////////////////
//Route for saving data to blockchain///
app.post('/save-to-blockchain/:fileHash', async (req, res) => {
  const fileHash = req.params.fileHash;

  try {
  const creditsCollection = db.collection('credits');

    // ✅ Step 1: Fetch credit document by file_hash
    const creditData = await creditsCollection.findOne({ file_hash: fileHash });

    if (!creditData) {
      return res.status(404).json({ error: 'Credit not found for given file_hash' });
    }

    // ✅ Step 2: Call Fabric chaincode via middleware
    await handleBlockchainListing(creditData);

    res.status(200).json({ message: 'Stored on blockchain successfully' });

  } catch (err) {
    console.error('Error saving to blockchain:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
});


// Get user's marketplace listings
app.get('/api/marketplace/my-listings', validateUser, async (req, res) => {
  try {
    const listings = await db.collection('marketplace_listings')
      .find({ sellerId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      listings: listings.map(listing => ({
        id: listing._id,
        serialNumber: listing.serialNumber,
        projectId: listing.projectId,
        projectName: listing.projectName,
        vintage: listing.vintage,
        amount: listing.amount,
        pricePerCredit: listing.pricePerCredit,
        totalValue: listing.totalValue,
        description: listing.description,
        status: listing.status,
        createdAt: listing.createdAt
      }))
    });

  } catch (err) {
    console.error('My listings fetch error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'fetch_failed',
      message: 'Failed to fetch your listings'
    });
  }
});

// Remove listing from marketplace
app.delete('/api/marketplace/listings/:listingId', validateUser, async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await db.collection('marketplace_listings').findOne({
      _id: new ObjectId(listingId),
      sellerId: req.user._id
    });

    if (!listing) {
      return res.status(404).json({ 
        success: false, 
        error: 'listing_not_found',
        message: 'Listing not found or does not belong to you'
      });
    }

    // Update listing status to 'removed'
    await db.collection('marketplace_listings').updateOne(
      { _id: new ObjectId(listingId) },
      { 
        $set: { 
          status: 'removed',
          removedAt: new Date()
        }
      }
    );

    // Update credit status back to 'authenticated'
    await db.collection('credits').updateOne(
      { _id: listing.creditId },
      { 
        $set: { status: 'authenticated' },
        $unset: { listedAt: 1, listingId: 1 }
      }
    );

    res.json({ 
      success: true,
      message: 'Listing removed from marketplace'
    });

  } catch (err) {
    console.error('Remove listing error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'remove_failed',
      message: 'Failed to remove listing'
    });
  }
});

// Get user credits
app.get('/api/users/me/credits', validateUser, async (req, res) => {
  try {
    const credits = await db.collection('credits')
      .find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .toArray();

    res.json({ 
      success: true,
      credits: credits.map(credit => ({
        serialNumber: credit.serialNumber,
        status: credit.status,
        uploadedAt: credit.uploadedAt,
        fileId: credit.fileId
      }))
    });
  } catch (err) {
    console.error('Credits fetch error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'fetch_failed',
      message: 'Failed to fetch credits'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});