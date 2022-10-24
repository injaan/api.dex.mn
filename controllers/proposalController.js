const Response = require("../modules/response.class");
const utils = require('../modules/utils');
const web3 = require('../modules/web3');
const models = require('../db/models');

const methods = {
    test:async function(req, res){
        let response = new Response();
        response.success = true;
        return response;
    },
    newProposal:async function(req, res){
        let response = new Response();
        const options = req.body.options.map(op=>{
            const keyPair = web3.getKeyPair();
            return {
                title:op.title,
                pubkey: keyPair.publicKey.toBase58(),
                secret: web3.secretToBase58(keyPair.secretKey)
            }
        });
        const proposalSecret = web3.getKeyPair();
        const proposal = await new models.Proposal({
            title: req.body.title,
            pubkey:proposalSecret.publicKey.toBase58(),
            secretkey: web3.secretToBase58(proposalSecret.secretKey),
            body:req.body.body,
            budget:req.body.budget,
            options
        }).save();
        response.success = true;
        response.data = proposal.getSafe();
        return response;
    }
}

module.exports = methods;