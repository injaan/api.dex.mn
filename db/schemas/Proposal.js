const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    signer:{type: String},
    signature:{type: String},
    title: {type: String, required:true},
    body:{type: String, required:true},
    budget:{type: Number, deafult:0},
    options:{type: [
        {
            title: {type:String, required:true},
            pubkey:{type:String, required:true, unique:true},
            secret:{type:String, required:true, unique:true}
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
        const fields = ['id','signer', 'signature', 'title', 'body', 'budget', 'options', 'status', 'logs', 'createdAt', 'updatedAt'];
        fields.forEach((field) => {
          transformed[field] = this[field];
        });
        transformed['options'] = this['options'].map(op=>({title:op.title, pbukey:op.pubkey}));
        return transformed;
    }
})

module.exports = schema;