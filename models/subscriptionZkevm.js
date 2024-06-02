const mongoose = require('mongoose');

const subscriptionZkEVMSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model',
    required: true
  },
  tokenId: {
    type: String,
    required: true
  },
  isListed: {
    type: Boolean,
    required: true,
    default: false 
  }
});

const SubscriptionZkEVM = mongoose.model('SubscriptionZkEVM', subscriptionZkEVMSchema);

module.exports = SubscriptionZkEVM;
