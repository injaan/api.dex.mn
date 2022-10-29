const bs58 = require('bs58');
const delay = require('delay');
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair
} = require('@solana/web3.js');
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const methods = {
    connection:null,
    connect: async function(){
        const prodRPCEndpoints = [
            'https://solana-api.projectserum.com',
            'https://api.mainnet-beta.solana.com',
            'https://ssc-dao.genesysgo.net',
            'https://solana-api.tt-prod.net'
        ]
        //const network = process.env.NODE_ENV==="production"?"mainnet-beta":"devnet";
        const endpoint = process.env.NODE_ENV==="production"?prodRPCEndpoints[0]:clusterApiUrl('devnet');
        try {
            if(module.exports.connection && await module.exports.connection.getVersion()){
                return module.exports.connection;
            } else {
                module.exports.connection = new Connection(endpoint, 'finalized');
                const version = await module.exports.connection.getVersion();
                console.log('Connection to cluster established:', endpoint, version);
            }
        } catch(ex){
            module.exports.connection = new Connection(endpoint, 'finalized');
            const version = await module.exports.connection.getVersion();
            console.log('Connection died and established new connection:', endpoint, version);
        }
        return module.exports.connection;
    },
    getKeyPair: function(){
        return new Keypair();
    },
    validateSignature:async function(signature){
        return '';
    },
    secretToBase58:function(secret){
        return bs58.encode(secret);
    },
    decodeMemo: function(txn){
        let memo = null;
        txn.transaction.message.instructions.forEach(inst=>{
            if(txn.transaction.message.accountKeys[inst.programIdIndex].toBase58() === MEMO_PROGRAM_ID.toBase58()){
                const decoded = bs58.decode(inst.data);
                memo =  new TextDecoder().decode(decoded);
            }
        });
        return memo;
    },
    validateSignatureForNewProposal: async function(signature, proposalId){
        const connection = await module.exports.connect();
        let txn = await connection.getParsedTransaction(signature, {commitment:'confirmed'});
        if(!txn){
            await delay(1000);
            txn = await connection.getParsedTransaction(signature, {commitment:'confirmed'});
        }
        if(!(txn && txn.transaction && txn.transaction.message && txn.transaction.message.instructions.length)){
            return false;
        }
        const memo = txn.transaction.message.instructions.find(instruction=>instruction.programId == MEMO_PROGRAM_ID.toBase58());
        if(!memo || !memo.parsed){
            return false;
        }
        const idFromMemo = JSON.parse(memo.parsed).QIP;
        if(idFromMemo != proposalId){
            return false;
        }
        console.log(idFromMemo)
        return false;
    }
}
module.exports = methods;