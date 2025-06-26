// src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const port = process.env.PORT;
const dbUri = process.env.MONGO_URI;
const apiKey = process.env.WEB3_STORAGE_KEY;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder (optional)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/credits', require('./routes/creditRoutes'));

// Test endpoint
app.get('/', (req, res) => {
  res.send('GreenCredits backend is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));