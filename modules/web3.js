const bs58 = require('bs58');
const {
    Keypair
} = require('@solana/web3.js');

const methods = {
    getKeyPair: function(){
        return new Keypair();
    },
    validateSignature:async function(signature){
        return '';
    },
    secretToBase58:function(secret){
        return bs58.encode(secret);
    }
}
module.exports = methods;