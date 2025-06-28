const express = require('express');
const Order = require('../models/Order'); // Import the Order model
const User = require('../models/User'); // Import User model to get address and clear cart
const Product = require('../models/Product'); // Import Product model for stock management
const { protect, authorize } = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

// @route   POST /api/orders
// @desc    Place a new order (from user's cart)
// @access  Private (User)
router.post('/', protect, async (req, res) => {
    const { paymentMethod, cartItems } = req.body;
    const userId = req.user._id; // User ID from authenticated token (from protect middleware)

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Use the user's registered address as the shipping address
        const shippingAddress = user.address; 
        if (!shippingAddress || shippingAddress === 'N/A') {
            return res.status(400).json({ message: 'User profile is missing a shipping address. Please update your profile.' });
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty. Cannot place an empty order.' });
        }

        let totalAmount = 0;
        const orderProducts = [];

        // Validate cart items and calculate total amount, and deduct stock
        for (const item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                // If product not found in DB, return error and don't place order
                return res.status(404).json({ message: `Product with ID ${item.productId} not found. Could not place order.` });
            }
            if (product.stock < item.quantity) {
                // If insufficient stock, return error
                return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
            }

            // Deduct stock from the product
            product.stock -= item.quantity;
            await product.save(); // Save the updated product stock

            // Add product details to the order items (FIXED: match schema)
            orderProducts.push({
                product: item.productId, // FIXED: use 'product' field
                quantity: item.quantity,
                price: product.price // Only fields required by schema
            });
            totalAmount += product.price * item.quantity;
        }

        // Create the new order (FIXED: match schema)
        const newOrder = new Order({
            user: userId,
            items: orderProducts,
            total: Number(totalAmount.toFixed(2)), // FIXED: use 'total' field
            paymentMethod,
            shippingAddress, 
            status: 'Pending' // FIXED: capitalized to match enum
        });

        // Save the order to the database
        const order = await newOrder.save();

        // Clear the user's cart within the User model after successful order creation
        user.cart = [];
        await user.save();

        // Debug log: print the new order to the server console
        console.log('Order created:', JSON.stringify(order, null, 2));

        res.status(201).json({ message: 'Order placed successfully!', order });

    } catch (error) {
        console.error('Order placement error:', error.message);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// @route   GET /api/orders
// @desc    Get all orders for the logged-in user
// @access  Private (User)
router.get('/', protect, async (req, res) => {
    const userId = req.user._id;

    try {
        // Corrected: Populate items.product to get product details for rendering on frontend
        const orders = await Order.find({ user: userId })
                                  .populate('items.product', 'name image') // FIXED: use 'product' not 'productId'
                                  .sort({ createdAt: -1 }); // Sort by newest first
        res.json(orders);
    } catch (error) {
        console.error('Fetch user orders error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/orders/my
// @desc    Get all orders for the logged-in user (alias for frontend compatibility)
// @access  Private (User)
router.get('/my', protect, async (req, res) => {
    const userId = req.user._id;
    try {
        const orders = await Order.find({ user: userId })
                                  .populate('items.product', 'name image') // FIXED: use 'product' not 'productId'
                                  .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Fetch user orders error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/orders/admin
// @desc    Get all orders (Admin only)
// @access  Private (Admin)
router.get('/admin', protect, authorize('admin'), async (req, res) => {
    try {
        // Populate user to get user details in the order response
        const orders = await Order.find().populate('user', 'name email address phone').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Fetch all orders for admin:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private (Admin)
router.put('/admin/:id/status', protect, authorize('admin'), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // New status (e.g., 'confirmed', 'shipped', 'delivered')

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Validate new status
        const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']; // Added 'Confirmed'
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status provided.' });
        }

        // Handle stock reversal if order is cancelled
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock += item.quantity; // Add quantity back to stock
                    await product.save();
                } else {
                    console.warn(`Product ${item.productId} not found when cancelling order ${order.id}. Stock not adjusted.`);
                }
            }
        } else if (order.status === 'Cancelled' && status !== 'Cancelled') {
            // Prevent changing status from cancelled unless there's a specific re-stocking logic
            return res.status(400).json({ message: 'Cannot change status from cancelled to active state without re-stocking logic.' });
        }


        order.status = status;
        await order.save();

        // Return the updated order, populated with user details if needed by frontend
        const updatedOrder = await Order.findById(id).populate('user', 'name email address phone'); // FIXED: use 'user' not 'userId'
        res.json({ message: `Order ${id} status updated to ${status}`, order: updatedOrder });

    } catch (error) {
        console.error('Update order status error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/orders/:id
// @desc    Delete an order (admin only)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        await order.deleteOne();
        res.json({ message: 'Order deleted' });
    } catch (error) {
        console.error('OrderRoutes ERROR: Failed to delete order:', error);
        res.status(500).json({ message: 'Server error deleting order.' });
    }
});

module.exports = router;