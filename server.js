const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Store orders in-memory for demonstration (replace with a database in production)
let orders = {};

// Endpoint to log completed orders
app.post('/logOrder', (req, res) => {
    const completedOrder = req.body;

    // Log the completed order
    console.log('Order received:', completedOrder);

    // Store the order in memory or database (here we are using a simple object)
    const customerName = completedOrder.customer;
    if (!orders[customerName]) {
        orders[customerName] = [];
    }
    orders[customerName].push(completedOrder);

    // Send a response back to confirm receipt
    res.send('Order logged successfully.');
});

// Endpoint to get all orders (optional, for admin viewing)
app.get('/orders', (req, res) => {
    res.json(orders);
});

// Endpoint to clear all orders (optional, for admin use)
app.delete('/orders', (req, res) => {
    orders = {}; // Clear all orders
    res.send('All orders have been cleared.');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
