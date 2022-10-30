const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    signer:{type: String},
    daoref:{type: String, default: process.env.DAO_REF},
    pubkey:{type: String, required:true, unique:true},
    secretkey:{type:String, required:true},
    signature:{type: String},
    date:{type:Date},
    title: {type: String, required:true},
    body:{type: String, required:true},
    budget:{type: Number, deafult:0},
    options:{type: [
        {
            title: {type:String, required:true},
            pubkey:{type:String, required:true, unique:true},
            secret:{type:String, required:true}
        }
    ], required:true},
    status:{type: String, default:'pending', enum:['pending', 'new', 'voting', 'approved', 'cancelled']},
    logs:{type:[
        {
            message:{type:String, required:true},
            date: {type:Date, required:true}
        }
    ]}
},{timestamps: true});

schema.method({
    getSafe(){
        let transformed = {};
        const fields = ['id','signer', 'pubkey', 'daoref', 'signature', 'title', 'body', 'budget', 'options', 'status', 'logs', 'createdAt', 'updatedAt'];
        fields.forEach((field) => {
          transformed[field] = this[field];
        });
        transformed['options'] = this['options'].map(op=>({title:op.title, pubkey:op.pubkey}));
        return transformed;
    }
})

module.exports = schema;