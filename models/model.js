// models/model.js
const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  modelId: {
    type: String,
    required: true,
    unique: true
  },
  ipfsUrl: {
    type: String,
    required: true
  }
});

const Model = mongoose.model('Model', modelSchema);

module.exports = Model;
