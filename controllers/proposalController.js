const Response = require("../modules/response.class");
const utils = require('../modules/utils');
const web3 = require('../modules/web3');
const models = require('../db/models');
const moment = require('moment');

const methods = {
    test:async function(req, res){
        let response = new Response();
        response.success = true;
        return response;
    },
    getProposalList:async function(req, res){
        let response = new Response();
        response.success = true;
        response.data = await models.Proposal.find({status:{$ne:'pending'}}, {_id:1, title:1, date:1, status:1}).sort({createdAt:-1})
        return response;
    },
    getProposal:async function(req, res){
        let response = new Response();
        response.success = true;
        const proposal = await models.Proposal.findById(req.params.id);
        if(!proposal){
            utils.throwErr("Proposal not found", 404);
            return;
        }
        response.data = proposal.getSafe();
        return response;
    },
    getProposalConfigs:async function(req, res){
        let response = new Response();
        response.success = true;
        response.data = {
            daoRef:process.env.DAO_REF,
            newPropReqQuest:process.env.DAO_NEW_PROPOSAL_REQUIRED_QUEST
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
            date:req.body.date,
            budget:req.body.budget,
            options
        }).save();
        response.success = true;
        response.data = proposal.getSafe();
        await models.Proposal.deleteMany({status:'pending',createdAt:{$lt:moment().subtract(1, 'day').toDate()}}); //clearing old non active records
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
        if(!await web3.validateSignatureForNewProposal(req.body.signature, proposal)){
            utils.throwErr("Invalid signature", 400);
            return;
        }
        await proposal.updateOne({signature: req.body.signature, status:'new'});
        response.success = true;
        return response;
    },
    saveVote:async function(req, res){
        let response = new Response();
        const validation = await web3.validateSignatureForVote(req.body.signature, models.Proposal);
        if(!validation){
            utils.throwErr("Invalid signature", 400);
            return;
        }
        const newvote = await new models.Vote({
            signature:req.body.signature,
            proposal:validation.proposal,
            votes:validation.votes,
            voter:validation.voter,
            option:validation.option
        }).save();
        console.log(newvote)
        response.data = newvote;
        response.success = true;
        return response;
    },
    getVotes:async function(req, res){
        let response = new Response();
        const votes = await models.Vote.find({proposal: req.params.proposalId});
        response.data = votes;
        response.success = true;
        return response;
    }
}

module.exports = methods;