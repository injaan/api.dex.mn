const bs58 = require('bs58');
const delay = require('delay');
const BigNumber = require('bignumber.js');
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair
} = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const QUEST_MINT = (process.env.NODE_ENV == 'production')?'6ybxMQpMgQhtsTLhvHZqk8uqao7kvoexY6e8JmCTqAB1':'AynrJdeB1RfXDhkPJw6PkP3BL4sKm3fehme6A8NcHpKK'
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
    getAssociatedTokenAddress: async function(walletAddress, mintAddress){
        const walletAddressPubkey = new PublicKey(walletAddress);
        const mintAddressPubkey = new PublicKey(mintAddress);
        const tokenAddress = await PublicKey.findProgramAddress(
          [
            walletAddressPubkey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintAddressPubkey.toBuffer(),
          ],
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        return tokenAddress[0];
    },
    getAccountInfo: async function(address){
        const pubkey = new PublicKey(address);
        const connection = await module.exports.connect();
        const info = await connection.getParsedAccountInfo(pubkey);
        if(info?.value?.data?.parsed){
            return info.value.data.parsed;
        } else {
            return null;
        }
    },
    validateSignatureForNewProposal: async function(signature, proposal){
        const connection = await module.exports.connect();
        let txn = await connection.getParsedTransaction(signature, {commitment:'confirmed'});
        if(!txn){
            await delay(1000);
            txn = await connection.getParsedTransaction(signature, {commitment:'confirmed'});
        }
        if(!(txn && txn.transaction && txn.transaction.message && txn.transaction.message.instructions.length)){
            return {success:false};
        }
        const memo = txn.transaction.message.instructions.find(instruction=>instruction.programId == MEMO_PROGRAM_ID.toBase58());
        if(!memo || !memo.parsed){
            return {success:false};
        }
        const idFromMemo = JSON.parse(memo.parsed).QIP;
        if(idFromMemo != proposal.id){
            return {success:false};
        }
        const mainAccPostTokenBal = txn.meta.postTokenBalances.find(srch=>(srch.owner===proposal.pubkey) && (srch.mint===QUEST_MINT));
        if(!mainAccPostTokenBal || mainAccPostTokenBal.uiTokenAmount.amount != process.env.DAO_NEW_PROPOSAL_REQUIRED_QUEST){
            return {success:false};
        }
        for (let option of proposal.options){
            const optionAccTokenBal =  txn.meta.postTokenBalances.find(srch=>(srch.owner===option.pubkey) && (srch.mint===QUEST_MINT));
            if(!optionAccTokenBal){
                return {success:false};
            }
        }
        const signer = txn.transaction.message.accountKeys.find(srch=>srch.signer)
        return {success:true, signer:signer.pubkey.toBase58()};
    },
    validateSignatureForVote: async function(signature, proposalModel){
        const connection = await module.exports.connect();
        let txn = await connection.getParsedTransaction(signature, {commitment:'confirmed'});
        if(!txn){
            await delay(1000);
            txn = await connection.getParsedTransaction(signature, {commitment:'confirmed'});
        }
        if(!(txn && txn.transaction && txn.transaction.message && txn.transaction.message.instructions.length)){
            return {
                success:false,
                msg:"invalid signature"
            };
        }
        const memo = txn.transaction.message.instructions.find(instruction=>instruction.programId == MEMO_PROGRAM_ID.toBase58());
        if(!memo || !memo.parsed){
            return {
                success:false,
                msg:"invalid signature"
            };
        }
        const idFromMemo = JSON.parse(memo.parsed).QIP;
        if(!idFromMemo){
            return {
                success:false,
                msg:"invalid signature"
            };
        }
        const tokenIx = txn.transaction.message.instructions.find(instruction=>instruction.programId == TOKEN_PROGRAM_ID.toBase58());
        if(!tokenIx){
            return {
                success:false,
                msg:"invalid signature"
            };
        }
        const proposal = await proposalModel.findById(idFromMemo);
        if(!proposal){
            return {
                success:false,
                msg:"invalid signature"
            };
        }
        if(proposal.status != 'voting'){
            return {
                success:false,
                msg:"Санал хураалт эхлээгүй эсвэл дууссан байна"
            };
        }
        let voteOption;
        for(let option of proposal.options){
            const tokenAcc = await module.exports.getAssociatedTokenAddress(option.pubkey, QUEST_MINT);
            if(tokenAcc.toBase58() == tokenIx.parsed.info.destination){
                voteOption = option;
                break;
            }
        }
        if(!voteOption){
            return {
                success:false,
                msg:"invalid signature"
            };
        }
        const srcAccInfo = await module.exports.getAccountInfo(tokenIx.parsed.info.source);
        if(!srcAccInfo){
            return {
                success:false,
                msg:"invalid signature"
            };
        }
        return {
            success: true,
            data :{
                proposal: idFromMemo,
                votes: BigNumber(tokenIx.parsed.info.amount).div((10**4)).toNumber(),
                voter:srcAccInfo.info.owner,
                option: voteOption.pubkey
            }
        };
    }
}
module.exports = methods;