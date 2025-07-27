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
const { Gateway, Wallets } = require('fabric-network');
const readline = require('readline');

const app = express();
const PORT = process.env.PORT || 5000;

// ====================== Configuration ======================
const ccpPath = '/home/aanchal/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
const walletPath = '/home/aanchal/Project2/Eco2/EcoLedger/Website/wallet';
const contractName = 'carboncredit';
const channelName = 'mychannel';

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
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

// ====================== Blockchain Functions ======================
async function connectToNetwork() {
    const userId = 'appUser';
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    
    const identities = await wallet.list();
console.log('Wallet identities:', identities);

    const identity = await wallet.get(userId);
    if (!identity) {
        throw new Error(`Identity for user not found in wallet`);
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true },
        eventHandlerOptions: {
      commitTimeout: 300,  // Increase timeout
      strategy: null  // Disable default strategy
    }
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(contractName);
    return { contract, gateway };
}


async function getUserInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// ====================== Interactive Menu ======================
async function showBlockchainMenu() {
    console.log('\n===== Blockchain Interaction Menu =====');
    console.log('1. Create Certificate');
    console.log('2. Get Certificate by ID');
    console.log('3. Get All Certificates');
    console.log('4. Update Authentication Status');
    console.log('5. List Certificate on Marketplace');
    console.log('6. Get Marketplace Listings');
    console.log('7. Get Certificate History');
    console.log('8. Return to main application');
    
    const choice = await getUserInput('Enter your choice (1-8): ');
    
    switch(choice) {
        case '1':
            await createCertificateInteractive();
            break;
        case '2':
            await getCertificateByIdInteractive();
            break;
        case '3':
            await getAllCertificatesInteractive();
            break;
        case '4':
            await updateAuthStatusInteractive();
            break;
        case '5':
            await listOnMarketplaceInteractive();
            break;
        case '6':
            await getMarketplaceListingsInteractive();
            break;
        case '7':
            await getCertificateHistoryInteractive();
            break;
        case '8':
            return;
        default:
            console.log('Invalid choice');
    }
    
    await showBlockchainMenu();
}

// ====================== Interactive Functions ======================
async function createCertificateInteractive() {
    console.log('\n=== Create Certificate ===');
    try {
        const { contract, gateway } = await connectToNetwork();
        
        const id = await getUserInput('Certificate ID: ');
        const projectID = await getUserInput('Project ID: ');
        const projectName = await getUserInput('Project Name: ');
        const vintage = await getUserInput('Vintage: ');
        const amount = await getUserInput('Amount: ');
        const issuanceDate = await getUserInput('Issuance Date (YYYY-MM-DD): ');
        const registry = await getUserInput('Registry: ');
        const category = await getUserInput('Category: ');
        const issuedTo = await getUserInput('Issued To: ');
        const owner = await getUserInput('Owner: ');
        const carbonmarkId = await getUserInput('Carbonmark ID: ');
        const carbonmarkName = await getUserInput('Carbonmark Name: ');
        const fileHash = await getUserInput('File Hash: ');
        const authStatus = await getUserInput('Auth Status (pending/authenticated/unauthenticated): ') || 'pending';

        const result = await contract.submitTransaction(
            'CreateCertificate',
            id,
            projectID,
            projectName,
            vintage,
            amount,
            issuanceDate,
            registry,
            category,
            issuedTo,
            owner,
            carbonmarkId,
            carbonmarkName,
            fileHash,
            authStatus
        );
        
        console.log('✅ Transaction successful:', JSON.parse(result.toString()));
        gateway.disconnect();
    } catch (error) {
        console.error('❌ Failed to create certificate:', error);
    }
}

async function getCertificateByIdInteractive() {
    console.log('\n=== Get Certificate by ID ===');
    try {
        const { contract, gateway } = await connectToNetwork();
        const id = await getUserInput('Certificate ID: ');
        
        const result = await contract.evaluateTransaction('GetCertificateById', id);
        console.log('Certificate:', JSON.parse(result.toString()));
        gateway.disconnect();
    } catch (error) {
        console.error('❌ Failed to get certificate:', error);
    }
}

async function getAllCertificatesInteractive() {
    console.log('\n=== Get All Certificates ===');
    try {
        const { contract, gateway } = await connectToNetwork();
        const result = await contract.evaluateTransaction('GetAllCertificates');
        console.log('All Certificates:', JSON.parse(result.toString()));
        gateway.disconnect();
    } catch (error) {
        console.error('❌ Failed to get certificates:', error);
    }
}

async function updateAuthStatusInteractive() {
    console.log('\n=== Update Authentication Status ===');
    try {
        const { contract, gateway } = await connectToNetwork();
        const id = await getUserInput('Certificate ID: ');
        const status = await getUserInput('New Status (authenticated/unauthenticated/pending): ');

        const result = await contract.submitTransaction('UpdateAuthStatus', id, status);
        console.log('✅ Status updated:', JSON.parse(result.toString()));
        gateway.disconnect();
    } catch (error) {
        console.error('❌ Failed to update status:', error);
    }
}

async function listOnMarketplaceInteractive() {
    console.log('\n=== List Certificate on Marketplace ===');
    try {
        const { contract, gateway } = await connectToNetwork();
        const id = await getUserInput('Certificate ID: ');
        const price = await getUserInput('Price per Credit: ');
        const description = await getUserInput('Description: ');

        const result = await contract.submitTransaction(
            'ListCertificateOnMarketplace',
            id,
            price,
            description
        );
        console.log('✅ Listing successful:', JSON.parse(result.toString()));
        gateway.disconnect();
    } catch (error) {
        console.error('❌ Failed to list certificate:', error);
    }
}

async function getMarketplaceListingsInteractive() {
    console.log('\n=== Get Marketplace Listings ===');
    try {
        const { contract, gateway } = await connectToNetwork();
        const result = await contract.evaluateTransaction('GetMarketplaceListings');
        console.log('Marketplace Listings:', JSON.parse(result.toString()));
        gateway.disconnect();
    } catch (error) {
        console.error('❌ Failed to get listings:', error);
    }
}

async function getCertificateHistoryInteractive() {
    console.log('\n=== Get Certificate History ===');
    try {
        const { contract, gateway } = await connectToNetwork();
        const id = await getUserInput('Certificate ID: ');
        const result = await contract.evaluateTransaction('GetCertificateHistory', id);
        console.log('Certificate History:', JSON.parse(result.toString()));
        gateway.disconnect();
    } catch (error) {
        console.error('❌ Failed to get history:', error);
    }
}

// ====================== API Routes ======================
// User Validation Middleware
const validateUser = async (req, res, next) => {
  const email = req.headers['email'];
  if (!email) return res.status(400).json({ success: false, error: 'email_required' });
  
  const user = await db.collection('users').findOne({ email });
  if (!user) return res.status(404).json({ success: false, error: 'user_not_found' });

  req.user = user;
  next();
};

// Auth Routes
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

app.post('/api/credits/upload', validateUser, upload.single('certificate'), async (req, res) => {
  let uploadStream;
  let mongoSuccess = false;
  let blockchainSuccess = false;
  let serial_number;

  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'no_file',
        message: 'No file uploaded' 
      });
    }

    // Authenticate with Flask
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

    // Store in GridFS
    uploadStream = gfsBucket.openUploadStream(`${serial_number}.pdf`, {
      metadata: { 
        userId: req.user._id,
        email: req.user.email
      }
    });
    uploadStream.end(req.file.buffer);
    mongoSuccess = true;

    // Prepare blockchain data
    const blockchainCert = {
      serialNumber: serial_number,
      projectId: flaskRes.data.extracted_data.project_id,
      projectName: flaskRes.data.extracted_data.project_name,
      vintage: flaskRes.data.extracted_data.vintage,
      amount: flaskRes.data.extracted_data.amount,
      registry: flaskRes.data.carbonmark_details?.name || 'Unknown',
      category: flaskRes.data.extracted_data.category,
      owner: req.user.email,
      fileHash: crypto.createHash('sha256').update(req.file.buffer).digest('hex')
    };

    // Attempt blockchain storage
    try {
      const currentTime = new Date().toISOString();
      const { contract, gateway } = await connectToNetwork(req.user.email);
      
      await contract.submitTransaction(
        'CreateCertificate',
        blockchainCert.serialNumber,
        blockchainCert.projectId,
        blockchainCert.projectName,
        blockchainCert.vintage,
        blockchainCert.amount.toString(),
        flaskRes.data.extracted_data.issuance_date || '',
        blockchainCert.registry,
        blockchainCert.category,
        flaskRes.data.extracted_data.issued_to || '',
        blockchainCert.owner,
        flaskRes.data.carbonmark_details?.id || '',
        flaskRes.data.carbonmark_details?.name || '',
        blockchainCert.fileHash,
        'pending',
        currentTime,
        currentTime
      );
      
      gateway.disconnect();
      blockchainSuccess = true;
    } catch (blockchainErr) {
      console.error('Blockchain storage failed (non-critical):', blockchainErr);
    }

    // Update MongoDB
    await db.collection('credits').updateOne(
      { serialNumber: serial_number },
      { 
        $set: {
          fileId: uploadStream.id,
          userId: req.user._id,
          userEmail: req.user.email,
          ...(blockchainSuccess && { 
            blockchainId: serial_number,
            blockchainStatus: 'minted' 
          })
        }
      },
      { upsert: true }
    );

    // Update user's credits list
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $addToSet: { credits: serial_number } }
    );

    res.status(201).json({
      success: true,
      serialNumber: serial_number,
      message: 'Certificate processed',
      storageStatus: {
        mongo: 'success',
        blockchain: blockchainSuccess ? 'success' : 'failed',
        ...(!blockchainSuccess && { 
          blockchainError: 'Certificate stored in MongoDB but not on blockchain' 
        })
      },
      data: {
        mongoId: uploadStream.id,
        ...(blockchainSuccess && { blockchainTx: serial_number }),
        authentication: flaskRes.data
      }
    });

  } catch (err) {
    console.error('Upload processing error:', err);
    
    if (uploadStream?.id && !mongoSuccess) {
      await gfsBucket.delete(uploadStream.id).catch(console.error);
    }

    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: err.message,
      storageStatus: {
        mongo: mongoSuccess ? 'success' : 'failed',
        blockchain: blockchainSuccess ? 'success' : 'not_attempted'
      }
    });
  }
});

// Marketplace Routes
app.post('/api/marketplace/list', validateUser, async (req, res) => {
  try {
    const { creditId, pricePerCredit, description } = req.body;
    
    if (!creditId || !pricePerCredit) {
      return res.status(400).json({ 
        success: false, 
        error: 'missing_fields',
        message: 'Credit ID and price per credit are required'
      });
    }

    if (isNaN(pricePerCredit) || pricePerCredit <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'invalid_price',
        message: 'Price per credit must be a positive number'
      });
    }

    const credit = await db.collection('credits').findOne({ 
      _id: new ObjectId(creditId),
      userId: req.user._id 
    });

    if (!credit) {
      return res.status(404).json({ 
        success: false, 
        error: 'credit_not_found',
        message: 'Credit not found or does not belong to you'
      });
    }

    const existingListing = await db.collection('marketplace_listings').findOne({ 
      creditId: new ObjectId(creditId),
      status: 'active'
    });

    if (existingListing) {
      return res.status(409).json({ 
        success: false, 
        error: 'already_listed',
        message: 'Credit is already listed on the marketplace'
      });
    }

    const listing = {
      creditId: new ObjectId(creditId),
      sellerId: req.user._id,
      sellerEmail: req.user.email,
      sellerName: req.user.name,
      serialNumber: credit.serialNumber,
      projectId: credit.projectId,
      projectName: credit.projectName,
      vintage: credit.vintage,
      amount: credit.amount,
      registry: credit.registry,
      category: credit.category,
      pricePerCredit: parseFloat(pricePerCredit),
      totalValue: parseFloat(pricePerCredit) * parseFloat(credit.amount),
      description: description || `Verified carbon credits from ${credit.projectName}`,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('marketplace_listings').insertOne(listing);

    await db.collection('credits').updateOne(
      { _id: new ObjectId(creditId) },
      { 
        $set: { 
          status: 'listed',
          listedAt: new Date(),
          listingId: result.insertedId
        }
      }
    );

    res.status(201).json({ 
      success: true,
      message: 'Credit successfully listed on marketplace',
      listing: {
        id: result.insertedId,
        serialNumber: credit.serialNumber,
        projectId: credit.projectId,
        pricePerCredit: parseFloat(pricePerCredit),
        totalValue: listing.totalValue,
        status: 'active'
      }
    });

  } catch (err) {
    console.error('Marketplace listing error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'listing_failed',
      message: 'Failed to list credit on marketplace'
    });
  }
});

// Other marketplace routes remain the same...

// Blockchain Routes
app.post('/api/blockchain/certificates', validateUser, async (req, res) => {
    try {
        const { contract, gateway } = await connectToNetwork(req.user.email);
        const result = await contract.submitTransaction(
            'CreateCertificate',
            req.body.serialNumber,
            req.body.projectId,
            req.body.projectName,
            req.body.vintage,
            req.body.amount.toString(),
            req.body.issuanceDate,
            req.body.registry,
            req.body.category,
            req.body.issuedTo,
            req.body.owner,
            req.body.carbonmarkId || '',
            req.body.carbonmarkName || '',
            req.body.fileHash,
            req.body.authStatus || 'pending'
        );
        
        gateway.disconnect();
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error('Blockchain error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'blockchain_error',
            message: error.message 
        });
    }
});

app.get('/api/blockchain/certificates/:id', validateUser, async (req, res) => {
    try {
        const { contract, gateway } = await connectToNetwork(req.user.email);
        const result = await contract.evaluateTransaction(
            'GetCertificateById',
            req.params.id
        );
        
        gateway.disconnect();
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error('Blockchain error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'blockchain_error',
            message: error.message 
        });
    }
});

// Other blockchain routes remain the same...

// Start server with optional menu
const startServer = async () => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        
        if (process.argv.includes('--interactive')) {
            showBlockchainMenu().catch(console.error);
        }
    });
};

startServer().catch(console.error);