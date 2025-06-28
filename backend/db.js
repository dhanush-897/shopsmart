// backend/db.js - MongoDB connection setup for ShopSmart
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shopsmart1';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const dbName = mongoose.connection.name;
    console.log(`MongoDB connected to database: ${dbName}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
