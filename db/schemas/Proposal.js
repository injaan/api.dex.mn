const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    qip:{type:Number},
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
            secret:{type:String, required:true},
            color:{type:String}
        }
    ], required:true},
    status:{type: String, default:'pending', enum:['pending', 'new', 'voting', 'completed', 'cancelled']},
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
        const fields = ['id', 'qip','signer', 'pubkey', 'daoref', 'signature', 'date', 'title', 'body', 'budget', 'options', 'status', 'logs', 'createdAt', 'updatedAt'];
        fields.forEach((field) => {
          transformed[field] = this[field];
        });
        transformed['options'] = this['options'].map(op=>({title:op.title, pubkey:op.pubkey, color: op.color}));
        return transformed;
    }
})

module.exports = schema;