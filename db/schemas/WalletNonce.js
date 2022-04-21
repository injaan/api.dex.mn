const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    nonce: { type: String , required: true},
    wallet: { type: String, unique: true }
},{timestamps: true});

schema.index({createdAt: 1},{expireAfterSeconds: 3600}); // expire in 1 minute

module.exports = schema;