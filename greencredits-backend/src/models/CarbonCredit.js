const mongoose = require('mongoose');

const CarbonCreditSchema = new mongoose.Schema({
  creditId: String,
  owner: String,
  ipfsCID: String,
  status: { type: String, default: 'uploaded' },
  carbonmarkScore: Number,
  registry: String,
  price: Number,
  metadata: Object
}, { timestamps: true });

module.exports = mongoose.model('CarbonCredit', CarbonCreditSchema);
