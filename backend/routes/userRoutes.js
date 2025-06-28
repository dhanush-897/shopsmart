const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        // Get all users, exclude passwords
        const users = await User.find().select('-password');

        // For each user, fetch cart (with product), wishlist (with product), and feedback (with product)
        const usersWithDetails = await Promise.all(users.map(async (user) => {
            // Populate cart products
            const cartPopulated = await User.findById(user._id)
                .select('cart')
                .populate('cart.productId', 'name price image');

            // Get wishlist for user
            const wishlist = await Wishlist.findOne({ userId: user._id })
                .populate('items.productId', 'name price image');

            // Get feedback for user
            const feedback = await Feedback.find({ userId: user._id })
                .populate('productId', 'name image');

            return {
                ...user.toObject(),
                cart: cartPopulated ? cartPopulated.cart : [],
                wishlist: wishlist ? wishlist.items : [],
                feedback: feedback || [],
            };
        }));

        res.json(usersWithDetails);
    } catch (error) {
        console.error('UserRoutes ERROR: Failed to fetch users:', error);
        res.status(500).json({ message: 'Server error fetching users.' });
    }
});

// @route   GET /api/users/:id/cart
// @desc    Get a specific user's cart (admin only)
// @access  Private/Admin
router.get('/:id/cart', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('cart.productId', 'name price image');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.cart || []);
    } catch (error) {
        console.error('UserRoutes ERROR: Failed to fetch user cart:', error);
        res.status(500).json({ message: 'Server error fetching user cart.' });
    }
});

// @route   GET /api/users/:id/wishlist
// @desc    Get a specific user's wishlist (admin only)
// @access  Private/Admin
router.get('/:id/wishlist', protect, authorize('admin'), async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.params.id }).populate('items.productId', 'name price image');
        if (!wishlist) return res.json([]);
        res.json(wishlist.items);
    } catch (error) {
        console.error('UserRoutes ERROR: Failed to fetch user wishlist:', error);
        res.status(500).json({ message: 'Server error fetching user wishlist.' });
    }
});

// @route   GET /api/users/:id/feedback
// @desc    Get a specific user's feedback (admin only)
// @access  Private/Admin
router.get('/:id/feedback', protect, authorize('admin'), async (req, res) => {
    try {
        const feedback = await Feedback.find({ userId: req.params.id }).populate('productId', 'name image');
        res.json(feedback);
    } catch (error) {
        console.error('UserRoutes ERROR: Failed to fetch user feedback:', error);
        res.status(500).json({ message: 'Server error fetching user feedback.' });
    }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private/Admin
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        user.role = role;
        await user.save();
        res.json({ message: 'User role updated', user });
    } catch (error) {
        console.error('UserRoutes ERROR: Failed to update user role:', error);
        res.status(500).json({ message: 'Server error updating user role.' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.deleteOne();
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('UserRoutes ERROR: Failed to delete user:', error);
        res.status(500).json({ message: 'Server error deleting user.' });
    }
});

module.exports = router;
