const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    signature:{type: String},
    proposal:{type: mongoose.Schema.Types.ObjectId, ref: 'Proposal'},
    option:{type:String},
    votes:{type: Number},
    voter:{type: String}
},{timestamps: true});

module.exports = schema;