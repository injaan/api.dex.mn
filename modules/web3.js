const {
    Keypair
} = require('@solana/web3.js');

const methods = {
    getKeyPair: function(){
        return new Keypair();
    },
    validateSignature:async function(signature){
        return '';
    }
}
module.exports = methods;