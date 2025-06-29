const path = require('path');
const CarbonCredit = require('../models/CarbonCredit');

// Upload Certificate and Save to DB
exports.uploadCertificate = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const ipfsCID = "mock-cid-" + Date.now();
    const creditId = "CREDIT-" + Date.now();

    const credit = new CarbonCredit({
      creditId,
      owner: "user123",
      ipfsCID,
      status: "uploaded"
    });

    await credit.save();

    // ✅ Add this debug log:
    console.log(`✅ Certificate saved: ${creditId}, CID: ${ipfsCID}`);

    res.status(201).json({
      message: 'Certificate uploaded and saved to DB',
      creditId,
      ipfsCID,
      filePath: `/uploads/${file.filename}`
    });

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({ error: 'Failed to upload and store credit' });
  }
};

// Authenticate Credit and Update DB
exports.authenticateCredit = async (req, res) => {
  const { creditId, owner, ipfsCID, metaJson } = req.body;

  try {
    const parsedMeta = JSON.parse(metaJson);
    const score = parsedMeta.carbonmarkScore || 75;

    if (score < 70) {
      return res.status(400).json({ error: 'Score too low to authenticate' });
    }

    const credit = await CarbonCredit.findOne({ creditId });

    if (!credit) {
      return res.status(404).json({ error: 'Credit not found' });
    }

    credit.status = 'authenticated';
    credit.owner = owner;
    credit.ipfsCID = ipfsCID;
    credit.carbonmarkScore = score;
    credit.registry = parsedMeta.registry;
    credit.metadata = parsedMeta;

    await credit.save();

    res.json({
      message: 'Credit authenticated successfully',
      creditId,
      score,
      status: credit.status,
      registry: credit.registry
    });

  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(500).json({ error: 'Failed to authenticate credit' });
  }
};

// List Credit for Sale
exports.listCredit = async (req, res) => {
  const { creditId, price } = req.body;

  try {
    const credit = await CarbonCredit.findOne({ creditId });

    if (!credit || credit.status !== 'authenticated') {
      return res.status(400).json({ error: 'Credit not found or not authenticated' });
    }

    credit.status = 'listed';
    credit.price = price;
    credit.listedAt = new Date();

    await credit.save();

    res.json({
      message: 'Credit listed for sale',
      creditId,
      price,
      listedAt: credit.listedAt,
      status: credit.status
    });

  } catch (error) {
    console.error('Listing error:', error.message);
    res.status(500).json({ error: 'Failed to list credit' });
  }
};
