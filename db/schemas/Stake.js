const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    wallet: {type: String, required:true},
    lock:{type: Number, min:30, max:360, required:true}, //lock days
    apy:{type: Number, required:true}, //annual percentage yeald
    status:{type: String, enum:['active', 'cancelled', 'completed']}
},{timestamps: true});

module.exports = schema;