// routes/productRoutes.js - Product management routes
const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Product model
const Feedback = require('../models/Feedback'); // NEW: Feedback model
const { protect, authorize } = require('../middleware/authMiddleware'); // Auth middleware

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, sortBy, order, page = 1, limit = 8 } = req.query;
    const query = {};

    if (search) {
      // Case-insensitive search by name or description
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' }; // Case-insensitive category search
    }

    let sortOptions = {};
    if (sortBy) {
      const sortOrder = order === 'desc' ? -1 : 1;
      sortOptions[sortBy] = sortOrder;
    } else {
      sortOptions.createdAt = -1; // Default sort by newest first
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
      totalProducts: count
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Fetch single product error:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// @desc    Add a new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  const { name, description, price, image, category, stock, weight, dimensions } = req.body; 

  try {
    const product = new Product({
      name,
      description,
      price,
      image,
      category, 
      stock,    
      weight,   
      dimensions 
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Server error adding product' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const { name, description, price, image, category, stock, weight, dimensions } = req.body; 

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name !== undefined ? name : product.name;
      product.description = description !== undefined ? description : product.description;
      product.price = price !== undefined ? price : product.price;
      product.image = image !== undefined ? image : product.image;
      product.category = category !== undefined ? category : product.category;       
      product.stock = stock !== undefined ? stock : product.stock;             
      product.weight = weight !== undefined ? weight : product.weight;         
      product.dimensions = dimensions !== undefined ? dimensions : product.dimensions; 

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (product) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// NEW: @desc    Submit feedback for a product
// NEW: @route   POST /api/products/:productId/feedback
// NEW: @access  Private (User)
router.post('/:productId/feedback', protect, async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if user has already submitted feedback for this product
    const existingFeedback = await Feedback.findOne({ productId, userId });
    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already submitted feedback for this product.' });
    }

    // Create new feedback entry
    const newFeedback = new Feedback({
      productId,
      userId,
      rating,
      comment,
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully!', feedback: newFeedback });

  } catch (error) {
    console.error('Submit feedback error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error submitting feedback.' });
  }
});


module.exports = router;
