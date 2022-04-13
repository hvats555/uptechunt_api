const Freelancer = require('@models/Freelancer');
const Dispute = require('@models/Dispute');
const Job = require('@models/Job');
const Contract = require('@models/Contract');
const error = require('@utils/error');
const filterAndPaginateV2 = require('@middleware/filterAndPaginateV2');
const mongoose = require('mongoose');
const { includes, isEmpty } = require('lodash');

const populateQuery = [
    {  
        path: 'freelancer',
        select: '_id user',
        populate: {
            path: 'user',
            select: 'profilePicture firstName lastName country email phone'
        }
    },

    {  
        path: 'client',
        select: '_id user',
        populate: {
            path: 'user',
            select: 'profilePicture firstName lastName country email phone'
        }
    },

    {
        path: 'contract',
        select: '-freelancer',
        populate: {
            path: 'job',
            select: '_id title description amount'
        }
    }
];

exports.newDispute = async (req, res) => {
    const contract = await Contract.findById(req.body.contractId);
    if(!contract) return res.status(404).json(error(["contract not found"]));

    const checkOpenDispute = await Dispute.find({'contract': contract._id, status: 'open'});

    if(!isEmpty(checkOpenDispute)) return res.status(409).json(error(["dispute is already open"]));

    const dispute = new Dispute({
        freelancer: contract.freelancer,
        client: contract.client,
        job: contract.job,
        disputeBy: req.body.disputeBy,
        contract: contract._id,
        description: req.body.description,
        attachments: req.body.attachments
    });

    dispute.save();

    const response = {
        message: "Dispute submitted",
        response: dispute
    }

    res.json(response);
}

exports.allDisputes = async (req, res) => {
    const query = {};
    // freelancer, client, job, disputeBy,

    if(req.query.status) { 
        if(!includes(['open', 'resolved'], req.query.status)) return res.status(400).json(error(["status can be either open or resolved"]));

        query.status = req.query.status 
    }

    if(req.query.disputeBy) { 
        if(!includes(['client', 'freelancer'], req.query.status)) return res.status(400).json(error(["disputeBy can only be either client or freelancer"]));

        query.disputeBy = req.query.disputeBy 
    }

    if(req.query.freelancerId) { 
        if(!mongoose.Types.ObjectId.isValid(req.query.freelancerId)) return res.status(400).json(error(["invalid object id"]));

        const freelancer = await Freelancer.findById(req.query.freelancerId);
        if(!freelancer) return res.status(404).json(error(["freelancer not found"]));

        query.freelancer = req.query.freelancerId 
    }

    if(req.query.clientId) { 
        if(!mongoose.Types.ObjectId.isValid(req.query.clientId)) return res.status(400).json(error(["invalid object id"]));

        const client = await Client.findById(req.query.clientId);
        if(!client) return res.status(404).json(error(["client not found"]));

        query.client = req.query.clientId 
    }

    if(req.query.contractId) { 
        if(!mongoose.Types.ObjectId.isValid(req.query.contractId)) return res.status(400).json(error(["invalid object id"]));
    
        const contract = await Contract.findById(req.query.contractId);
        if(!contract) return res.status(404).json(error(["contract not found"]));
    
        query.contract = req.query.contractId
    }

    const results = await filterAndPaginateV2(req.query.page, req.query.limit, Dispute, query, null, 
    populateQuery);

    const response = {
        message: "Disputes",
        meta: results.meta,
        response: {
            results: results.results
        }
    }

    res.json(response);
}

exports.getDisputeById = async (req, res) => {
    const dispute = await Dispute.findById(req.params.id).populate(populateQuery);
    
    if(!dispute) return res.status(404).json(error(["cannot find dispute"]));

    res.json({
        message: `Dispute id : ${req.params.id}`,
        response: dispute
    });
}

// open, resolved

exports.disputeAction = async (req, res) => {
    let {disputeId, status} = req.body;

    if(status != 'resolved') return res.status(400).json(error(["invalid dispute status"]));

    const dispute = await Dispute.findByIdAndUpdate(disputeId, {status: status}, {new: true});

    console.log(dispute);

    if(!dispute) return res.status(404).json(error(["unable to change dispute status"]));

    res.json({
        message: `Dispute is ${dispute.status}`,
        result: {}
    });    
}