// models/Wishlist.js - Mongoose Wishlist Schema
const mongoose = require('mongoose');

const wishlistItemSchema = mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Product model's _id
    required: true,
    ref: 'Product' // Establishes a reference to the 'Product' model
  },
  // You might want to store basic product info here to avoid extra lookups
  // But for now, we'll rely on populate in the route
}, {
  _id: false // Do not create a separate _id for subdocuments (wishlist items)
});

const wishlistSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User model's _id
      required: true,
      unique: true, // Each user has only one wishlist document
      ref: 'User' // Establishes a reference to the 'User' model
    },
    items: [wishlistItemSchema], // Array of wishlist items
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
