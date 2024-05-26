// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const routes = require('./routes/routes');  
const cors = require('cors');

// Middleware
app.use(bodyParser.json());
app.use(cors())
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
