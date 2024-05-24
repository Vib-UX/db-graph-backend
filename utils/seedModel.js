const mongoose = require('mongoose');
const Model = require('../models/model');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

const baseIpfsUrl = 'https://ipfs.io/ipfs/QmZK5PeA17xdmJv57JdPMD4AHzxGA2Fms1iDuRZQegcpUq';

const models = [
    { name: 'Priya Anjali Rai', modelId: '1', ipfsUrl: `${baseIpfsUrl}/1.json` },
    { name: 'Poonam Pandey', modelId: '2', ipfsUrl: `${baseIpfsUrl}/2.json` },
    { name: 'Sahara Knite', modelId: '3', ipfsUrl: `${baseIpfsUrl}/3.json` },
    { name: 'Persia Pele', modelId: '4', ipfsUrl: `${baseIpfsUrl}/4.json` },
    { name: 'Serena Mann', modelId: '5', ipfsUrl: `${baseIpfsUrl}/5.json` },
    { name: 'Viva Athena', modelId: '6', ipfsUrl: `${baseIpfsUrl}/6.json` },
    { name: 'Anjali Kara', modelId: '7', ipfsUrl: `${baseIpfsUrl}/7.json` },
    { name: 'Sherlyn Chopra', modelId: '8', ipfsUrl: `${baseIpfsUrl}/8.json` },
    { name: 'Sophia Silva', modelId: '9', ipfsUrl: `${baseIpfsUrl}/9.json` },
    { name: 'Isabella Blue', modelId: '10', ipfsUrl: `${baseIpfsUrl}/10.json` },
    { name: 'Ruby Spark', modelId: '11', ipfsUrl: `${baseIpfsUrl}/11.json` },
    { name: 'Alice Gold', modelId: '12', ipfsUrl: `${baseIpfsUrl}/12.json` },
    { name: 'Samantha Rose', modelId: '13', ipfsUrl: `${baseIpfsUrl}/13.json` },
    { name: 'Ava Adams', modelId: '14', ipfsUrl: `${baseIpfsUrl}/14.json` },
    { name: 'Lily Cruz', modelId: '15', ipfsUrl: `${baseIpfsUrl}/15.json` },
    { name: 'Evelyn Green', modelId: '16', ipfsUrl: `${baseIpfsUrl}/16.json` },
];

Model.insertMany(models)
  .then(() => {
    console.log("Models seeded successfully");
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Error seeding models:", err);
    mongoose.connection.close();
  });
