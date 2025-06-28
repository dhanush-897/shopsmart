const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors
const connectDB = require('./db'); // Import DB connection (assuming config/db.js connects)
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const productRoutes = require('./routes/productRoutes'); // Import product routes
const orderRoutes = require('./routes/orderRoutes'); // Import order routes
const cartRoutes = require('./routes/cartRoutes'); // Import cart routes
const wishlistRoutes = require('./routes/wishlistRoutes'); // Import wishlist routes (if exists)
const feedbackRoutes = require('./routes/feedbackRoutes'); // NEW: Import feedback routes
const userRoutes = require('./routes/userRoutes'); // Import user routes

dotenv.config(); // Load environment variables from .env file

connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for debugging
    allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable CORS for all routes and allow Authorization header
app.use(express.json()); // Body parser for JSON data

// Routes
app.use('/api/auth', authRoutes); // Authentication routes (login, register, profile, user management)
app.use('/api/products', productRoutes); // Product management routes (CRUD for products)
app.use('/api/orders', orderRoutes); // Order management routes (place order, user orders, admin orders)
app.use('/api/cart', cartRoutes); // Shopping cart routes (add, update, remove, clear cart)
app.use('/api/wishlist', wishlistRoutes); // Wishlist routes (assuming you have this)
app.use('/api/feedback', feedbackRoutes); // NEW: Feedback routes (for submitting and viewing feedback)
app.use('/api/users', userRoutes); // User management routes (admin only)


// Simple root route for API status check
app.get('/', (req, res) => {
    res.send('ShopSmart API is running...');
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack to the console for debugging
    res.status(500).send('Something broke on the server!'); // Send a generic error message
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});