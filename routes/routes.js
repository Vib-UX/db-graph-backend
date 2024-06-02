// routes/routes.js
const express = require('express');
const User = require('../models/user');
const Model = require('../models/model');
const Subscription = require('../models/subscription');
const SubscriptionZkevm = require('../models/subscriptionZkevm')
const SubscriptionMoonbeam = require('../models/subscriptionMoonbeam')
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

// Route to get user information along with their subscriptions and associated model details
router.get('/user-info', async (req, res) => {
  const { wallet_address } = req.query;
  try {
    const user = await User.findOne({ wallet_address }).exec();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch subscriptions and populate model details
    const subscriptions = await Subscription.find({ user: user._id })
      .populate({
        path: 'model',
        select: 'name modelId ipfsUrl' // Selecting specific fields from the Model
      })
      .exec();

    // Construct a result object including user and their subscriptions with model details
    const result = {
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: user,
        subscriptions: subscriptions.map(sub => ({
          modelId: sub.model.modelId,
          modelName: sub.model.name,
          ipfsUrl: sub.model.ipfsUrl,
          tokenId: sub.tokenId,
          isListed: sub.isListed,
          price: sub.price
        }))
      }
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user data', error: error.message });
  }
});

// Route to get user information based on email, along with their subscriptions and associated model details
router.get('/user-info-moonbeam', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email }).exec(); // Search user by email
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch Moonbeam-specific subscriptions and populate model details
    const subscriptions = await SubscriptionMoonbeam.find({ user: user._id })
      .populate({
        path: 'model',
        select: 'name modelId ipfsUrl' // Selecting specific fields from the Model
      })
      .exec();

    // Construct a result object including user and their Moonbeam subscriptions with model details
    const result = {
      success: true,
      message: 'User retrieved successfully',
      data: {
        user,
        subscriptions: subscriptions.map(sub => ({
          modelId: sub.model.modelId,
          modelName: sub.model.name,
          ipfsUrl: sub.model.ipfsUrl,
          tokenId: sub.tokenId,
          isListed: sub.isListed,
          price: sub.price
        }))
      }
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user data', error: error.message });
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
    res.status(200).json({
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

// List a subscription
router.patch('/list-subscription', async (req, res) => {
  const { tokenId } = req.body;
  try {
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { tokenId },
      { $set: { isListed: true } },
      { new: true }
    );
    if (!updatedSubscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.status(200).json({ success: true, message: 'Subscription listed successfully', data: updatedSubscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list subscription', error: error.message });
  }
});

// Update subscription's user
router.patch('/update-subscription', async (req, res) => {
  const { tokenId, wallet_address } = req.body;
  try {
    const user = await User.findOne({ wallet_address });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedSubscription = await Subscription.findOneAndUpdate(
      { tokenId },
      { $set: { user: user._id, isListed: false } },
      { new: true }
    );
    if (!updatedSubscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.status(200).json({ success: true, message: 'Subscription updated successfully', data: updatedSubscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update subscription', error: error.message });
  }
});

// Fetch all listed subscriptions
router.get('/listed-subscriptions', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ isListed: true }).populate('model', 'modelId');
    res.status(200).json({
      success: true,
      message: 'Listed subscriptions retrieved successfully',
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve listed subscriptions', error: error.message });
  }
});

// Purchase a subscription Zkevm
router.post('/purchase-subscription-zkevm', async (req, res) => {
  const { email, modelId, tokenId } = req.body;
  try {
    // Ensure both user and model exist based on email and modelId
    const userExists = await User.findOne({ email: email });
    const modelExists = await Model.findOne({ modelId: modelId });
    if (!userExists || !modelExists) {
      return res.status(404).json({ success: false, message: 'User or Model not found with provided identifiers' });
    }

    // Create subscription using the ids from the fetched documents
    const newSubscription = new SubscriptionZkevm({
      user: userExists._id,
      model: modelExists._id,
      tokenId
    });
    await newSubscription.save();
    res.status(200).json({
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

// List a subscription Zkemv
router.patch('/list-subscription-zkevm', async (req, res) => {
  const { tokenId } = req.body;
  try {
    const updatedSubscription = await SubscriptionZkevm.findOneAndUpdate(
      { tokenId },
      { $set: { isListed: true } },
      { new: true }
    );
    if (!updatedSubscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.status(200).json({ success: true, message: 'Subscription listed successfully', data: updatedSubscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list subscription', error: error.message });
  }
});

// Update subscription's user Zkevm
router.patch('/update-subscription-zkevm', async (req, res) => {
  const { tokenId, wallet_address } = req.body;
  try {
    const user = await User.findOne({ wallet_address });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedSubscription = await SubscriptionZkevm.findOneAndUpdate(
      { tokenId },
      { $set: { user: user._id, isListed: false } },
      { new: true }
    );
    if (!updatedSubscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.status(200).json({ success: true, message: 'Subscription updated successfully', data: updatedSubscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update subscription', error: error.message });
  }
});

// Fetch all listed subscriptions Zkevm
router.get('/listed-subscriptions-zkevm', async (req, res) => {
  try {
    const subscriptions = await SubscriptionZkevm.find({ isListed: true }).populate('model', 'modelId');
    res.status(200).json({
      success: true,
      message: 'Listed subscriptions retrieved successfully',
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve listed subscriptions', error: error.message });
  }
});


// Purchase a subscription Moonbeam
router.post('/purchase-subscription-moonbeam', async (req, res) => {
  const { email, modelId, tokenId } = req.body;
  try {
    // Ensure both user and model exist based on email and modelId
    const userExists = await User.findOne({ email: email });
    const modelExists = await Model.findOne({ modelId: modelId });
    if (!userExists || !modelExists) {
      return res.status(404).json({ success: false, message: 'User or Model not found with provided identifiers' });
    }

    // Create subscription using the ids from the fetched documents
    const newSubscription = new SubscriptionMoonbeam({
      user: userExists._id,
      model: modelExists._id,
      tokenId
    });
    await newSubscription.save();
    res.status(200).json({
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

// List a subscription Moonbeam
router.patch('/list-subscription-moonbeam', async (req, res) => {
  const { tokenId, price } = req.body;
  console.log(`Updating subscription for tokenId: ${tokenId} with new price: ${price}`);
  try {
    const updatedSubscription = await SubscriptionMoonbeam.findOneAndUpdate(
      { tokenId }, // Query only by tokenId
      { $set: { price: price, isListed: true } }, // Update the price and isListed
      { new: true }
    );
    if (!updatedSubscription) {
      console.log('Subscription not found in the database.');
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.status(200).json({ success: true, message: 'Subscription listed successfully', data: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ success: false, message: 'Failed to list subscription', error: error.message });
  }
});


// Update subscription's user Moonbeam
router.patch('/update-subscription-moonbeam', async (req, res) => {
  const { tokenId, wallet_address } = req.body;
  try {
    const user = await User.findOne({ wallet_address });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedSubscription = await SubscriptionMoonbeam.findOneAndUpdate(
      { tokenId },
      { $set: { user: user._id, isListed: false } },
      { new: true }
    );
    if (!updatedSubscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    res.status(200).json({ success: true, message: 'Subscription updated successfully', data: updatedSubscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update subscription', error: error.message });
  }
});

// Fetch all listed subscriptions Moonbeam
router.get('/listed-subscriptions-moonbeam', async (req, res) => {
  try {
    const subscriptions = await SubscriptionMoonbeam.find({ isListed: true }).populate('model', 'modelId');
    res.status(200).json({
      success: true,
      message: 'Listed subscriptions retrieved successfully',
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve listed subscriptions', error: error.message });
  }
});



module.exports = router;
