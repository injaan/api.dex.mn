const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    wallet: { type: String },
    txn: { type: String }
},{timestamps: true});

module.exports = schema;