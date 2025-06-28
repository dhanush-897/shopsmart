// backend/models/Feedback.js - Mongoose model for product feedback
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate feedback per user per product
feedbackSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
