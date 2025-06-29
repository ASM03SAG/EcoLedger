const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function uploadToPinata(localFilePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const data = new FormData();
  data.append('file', fs.createReadStream(localFilePath));

  const res = await axios.post(url, data, {
    maxBodyLength: 'Infinity',
    headers: {
      ...data.getHeaders(),
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_API_SECRET,
    },
  });

  return res.data.IpfsHash; // This is the CID
}

module.exports = { uploadToPinata };