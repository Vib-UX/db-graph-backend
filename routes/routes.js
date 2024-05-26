// routes/routes.js
const express = require('express');
const User = require('../models/user');
const Model = require('../models/model');
const Subscription = require('../models/subscription');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, wallet_address, ipfs_url, openAi_tokenId } = req.body;
  try {
    // Validate if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }, { wallet_address }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists with the provided email, username, or wallet address.' });
    }

    // Create new user
    const newUser = new User({ username, email, wallet_address, ipfs_url, openAi_tokenId });
    await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully', data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to register user', error: error.message });
  }
});

// Purchase a subscription
router.post('/purchase-subscription', async (req, res) => {
    const { email, modelId, tokenId } = req.body;
    try {
      // Ensure both user and model exist based on email and modelId
      const userExists = await User.findOne({ email: email });
      const modelExists = await Model.findOne({ modelId: modelId });
      if (!userExists || !modelExists) {
        return res.status(404).json({ success: false, message: 'User or Model not found with provided identifiers' });
      }
  
      // Create subscription using the ids from the fetched documents
      const newSubscription = new Subscription({
        user: userExists._id,
        model: modelExists._id,
        tokenId
      });
      await newSubscription.save();
      res.status(201).json({
        success: true,
        message: 'Subscription purchased successfully',
        data: {
          userId: userExists._id,
          modelId: modelExists._id,
          tokenId
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to purchase subscription', error: error.message });
    }
  });
  

// Query user and model details based on user's wallet address and tokenId
router.get('/user-model-info', async (req, res) => {
  const { wallet_address, tokenId } = req.query;
  try {
    const subscription = await Subscription.findOne({ tokenId }).populate('user model');
    console.log(subscription)
    if (!subscription || subscription.user.wallet_address.toLowerCase() !== wallet_address.toLowerCase()) {
      return res.status(404).json({ success: false, message: 'No subscription matches the provided details' });
    }

    res.status(200).json({ success: true, message: 'Data retrieved successfully', data: { user: subscription.user, model: subscription.model } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve data', error: error.message });
  }
});

router.get('/user-info', async (req, res) => {
  const { wallet_address } = req.query;
  try {
    const user = await User.findOne({ wallet_address });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User retrieved successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user data', error: error.message });
  }
});

module.exports = router;
