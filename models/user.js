const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  wallet_address: {
    type: String,
    required: true,
    unique: true
  },
  ipfs_url: {
    type: String,
    required: false  
  },
  openAi_tokenId: {
    type: String,
    required: false  
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
