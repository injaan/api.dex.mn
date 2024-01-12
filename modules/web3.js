const util = require('util');
const bs58 = require('bs58');
const nacl = require('tweetnacl');
const delay = require('delay');
const BigNumber = require('bignumber.js');
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair
} = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const { encodeURL, createQR } = require('@solana/pay');
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const QUEST_MINT = (process.env.NODE_ENV == 'production')?'6ybxMQpMgQhtsTLhvHZqk8uqao7kvoexY6e8JmCTqAB1':'AynrJdeB1RfXDhkPJw6PkP3BL4sKm3fehme6A8NcHpKK'
const methods = {
    assets: {
        quest: {name:"Quest", ticker:"QUEST", priceMNT:0.0001, minBuy: 10,"decimalsOnChain": 4,"decimalsOnApp": 4, mineable:false, defaultResourceOnTile:0, minAmountToClaim:0, mineDifficulty: 100000000, mint:(process.env.NODE_ENV==="production")?'6ybxMQpMgQhtsTLhvHZqk8uqao7kvoexY6e8JmCTqAB1':'AynrJdeB1RfXDhkPJw6PkP3BL4sKm3fehme6A8NcHpKK'},
        aurm: {name:"Aurorium", ticker:"AURM", priceMNT:4.5, minBuy: 10,"decimalsOnChain": 9, "decimalsOnApp": 4, mineable:false, defaultResourceOnTile:0, minAmountToClaim:0, mineDifficulty: 10000, mint: (process.env.NODE_ENV==="production")?'Dzsb9REsrxZ3cG6ucgvE1ATiWMawsRXeaDxDGZcL4gLx':'C7JiTZQ3yDjKtUyMakzvqsMzySoeDzXSsYJhEvKMZTHh'},
        slrm: {name:"Solarium", ticker:"SLRM", priceMNT:1, minBuy: 4000, "decimalsOnChain": 9, "decimalsOnApp": 4, mineable:true, defaultResourceOnTile:15000000, minAmountToClaim:100000, mineDifficulty: 1, mint: (process.env.NODE_ENV==="production")?'Fh7PGdaNgbWsHX7KpHaxqh2312fm3kYAiKgz4Jz8UcVA':'BQqmiQt3qavUiPUk1She8BrjgcrW8Ub1J6YsqGHWATtc'}
    },
    connection:null,
    connect: async function(){
        const prodRPCEndpoints = [
            'https://light-fittest-shard.solana-mainnet.discover.quiknode.pro/fd0b5df53b17b8ac6755e1ce11e5ebf1a217d523/'
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
        try {
            const connection = await module.exports.connect();
            let txn = await connection.getParsedTransaction(signature, {commitment:'confirmed', maxSupportedTransactionVersion: 0});
            console.log(txn)
            if(!txn){
                await delay(3000);
                txn = await connection.getParsedTransaction(signature, {commitment:'confirmed', maxSupportedTransactionVersion: 0,});
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
        } catch(ex){
            console.log(ex);
            return {success:false};
        }
        
    },
    validateSignatureForVote: async function(signature, proposalModel){
        try {
            const connection = await module.exports.connect();
            let txn = await connection.getParsedTransaction(signature, {commitment:'confirmed', maxSupportedTransactionVersion: 0});
            if(!txn){
                await delay(1000);
                txn = await connection.getParsedTransaction(signature, {commitment:'confirmed', maxSupportedTransactionVersion: 0});
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
            if(new Date(proposal.date) < new Date()){
                await proposal.updateOne({
                    status:'completed'
                });
                return {
                    success:false,
                    msg:"Санал хураалтын хугацаа дууссан байна"
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
                    proposal: proposal,
                    votes: BigNumber(tokenIx.parsed.info.amount).div((10**4)).toNumber(),
                    voter:srcAccInfo.info.owner,
                    option: voteOption.pubkey
                }
            };
        } catch(ex){
            console.log(ex)
            return {
                success:false,
                msg:"invalid signature"
            };
        }
    },
    verifyMessage: function(message, signature, pubkey){
        const msgData = new util.TextEncoder().encode(message);
        const signatureBuffer = bs58.decode(signature);
        const pubKeyBuffer = bs58.decode(pubkey);
        const verify = nacl.sign.detached.verify(msgData, signatureBuffer, pubKeyBuffer);
        return verify;
    },
    createSolPayQRUrl: function({asset, to, rawAmount, label, message, memo, ref}){
        const recipient = new PublicKey(to);
        const amount = new BigNumber(rawAmount).div(10**module.exports.assets[asset].decimalsOnChain);
        const reference = ref;
        const splToken = new PublicKey(module.exports.assets[asset].mint);
        const url = encodeURL({
            recipient,
            amount,
            splToken,
            reference,
            label,
            message,
            memo,
        });
        return {url:url, ref: reference.toBase58()};
    }
}
module.exports = methods;