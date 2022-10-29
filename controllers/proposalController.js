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
    getProposalConfigs:async function(req, res){
        let response = new Response();
        response.success = true;
        response.data = {
            daoRef:process.env.DAO_REF
        }
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
    },
    updateSignature:async function(req, res){
        let response = new Response();
        const proposal = await models.Proposal.findById(req.body.proposal);
        if(!proposal){
            utils.throwErr("Proposal not found", 404);
            return;
        }
        //validate signature
        if(!await web3.validateSignatureForNewProposal(req.body.signature, proposal._id)){
            utils.throwErr("Invalid signature", 400);
            return;
        }
        await proposal.updateOne({signature: req.body.signature});
        response.success = true;
        return response;
    }
}

module.exports = methods;