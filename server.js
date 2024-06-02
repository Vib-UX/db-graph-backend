// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const SubscriptionMoonbeam = require('./models/subscriptionMoonbeam')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const routes = require('./routes/routes');  
const cors = require('cors');

// Middleware
app.use(bodyParser.json());
app.use(cors());
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

//   SubscriptionMoonbeam.updateMany(
//     { price: { $exists: false } }, // Filter to find documents where price does not exist
//     { $set: { price: "10" } } // Set the price to "10" for all matched documents
// )
// .then(result => {
//     console.log(`Documents matched: ${result.n}`);
//     console.log(`Documents modified: ${result.nModified}`);
//     mongoose.disconnect(); // Disconnect after operation is complete
// })
// .catch(err => {
//     console.error('Error updating documents:', err);
//     mongoose.disconnect(); // Ensure disconnection on error
// });

// Use routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
