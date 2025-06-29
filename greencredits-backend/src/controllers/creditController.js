const path = require('path');
const fs = require('fs');
const CarbonCredit = require('../models/CarbonCredit');
const { uploadToPinata } = require('../utils/pinata');

// Controller: Upload Certificate and Save to IPFS (Pinata)
exports.uploadCertificate = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const localPath = path.join(__dirname, '../../uploads', file.filename);

    // Upload to IPFS using Pinata
    const ipfsCID = await uploadToPinata(localPath);

    const creditId = 'CREDIT-' + Date.now();

    const newCredit = new CarbonCredit({
      creditId,
      ipfsCID,
      filePath: `/uploads/${file.filename}`,
      owner: 'user123',
      status: 'uploaded'
    });

    await newCredit.save();

    res.status(201).json({
      message: 'Certificate uploaded to Pinata IPFS and saved to DB',
      creditId,
      ipfsCID,
      filePath: `/uploads/${file.filename}`
    });
  } catch (err) {
    console.error('Upload Error:', err.message);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// Controller: Authenticate Certificate using metadata (mocked)
exports.authenticateCredit = async (req, res) => {
  try {
    const { creditId, owner, ipfsCID, metaJson } = req.body;

    const credit = await CarbonCredit.findOne({ creditId });
    if (!credit) {
      return res.status(404).json({ error: 'Credit not found' });
    }

    const parsedMeta = JSON.parse(metaJson);
    const score = parsedMeta.carbonmarkScore || 0;

    if (!parsedMeta.authenticated || score < 70) {
      return res.status(400).json({ error: 'Score too low or not authenticated' });
    }

    // Update the document in MongoDB
    credit.status = 'authenticated';
    credit.metadata = {
      carbonmarkScore: score,
      registry: parsedMeta.registry,
      registryLink: parsedMeta.registryLink,
      projectType: parsedMeta.projectType,
      authenticated: true
    };
    await credit.save();

    res.status(200).json({
      creditId,
      status: credit.status,
      score,
      ipfsCID,
      metadata: credit.metadata
    });
  } catch (err) {
    console.error('Auth Error:', err.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Controller: List Authenticated Credit on Marketplace
exports.listCredit = async (req, res) => {
  try {
    const { creditId, price } = req.body;

    const credit = await CarbonCredit.findOne({ creditId });
    if (!credit) {
      return res.status(404).json({ error: 'Credit not found' });
    }

    if (credit.status !== 'authenticated') {
      return res.status(400).json({ error: 'Only authenticated credits can be listed' });
    }

    credit.status = 'listed';
    credit.price = parseFloat(price);
    credit.listedAt = new Date();
    await credit.save();

    res.status(200).json({
      message: 'Credit listed for sale',
      creditId,
      price: credit.price,
      listedAt: credit.listedAt
    });
  } catch (err) {
    console.error('Listing Error:', err.message);
    res.status(500).json({ error: 'Listing failed' });
  }
};
