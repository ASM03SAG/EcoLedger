const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadCertificate,
  authenticateCredit,
  listCredit,
} = require('../controllers/creditController');

// POST /api/credits/upload
router.post(
  '/upload',
  upload.single('certificate'),
  uploadCertificate
);

// POST /api/credits/authenticate
router.post(
  '/authenticate',
  authenticateCredit
);

// POST /api/credits/list 
router.post(
  '/list',
  listCredit
);

module.exports = router;
