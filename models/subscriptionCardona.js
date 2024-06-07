const mongoose = require('mongoose');

const subscriptionCardonaSchema = new mongoose.Schema({
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
  price:{
    type: String,
    required: false
  },
  isListed: {
    type: Boolean,
    required: true,
    default: false 
  }
});

const SubscriptionCardona = mongoose.model('SubscriptionCardona', subscriptionCardonaSchema);

module.exports = SubscriptionCardona;
