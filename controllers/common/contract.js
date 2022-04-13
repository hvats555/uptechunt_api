const mongoose = require('mongoose');
const Freelancer = require('@models/Freelancer');
const Contract = require('@models/Contract');
const Job = require('@models/Job');
const Proposal = require('@models/Proposal');
const _ = require('lodash');

const error = require("@utils/error");
const filterAndPaginateV2 = require('@middleware/filterAndPaginateV2');

const populateQuery = [
    {  
        path: 'freelancer',
        select: 'hourlyPrice rating totalEarnings user',
        populate: {
            path: 'user',
            select: 'profilePicture firstName lastName country'
        }
    },

    {  
        path: 'client',
        select: '_id user',
        populate: {
            path: 'user',
            select: 'profilePicture firstName lastName country'
        }
    },

    {
        path: 'job',
        select: '-proposals -contracts -skillCategories -client -__v',
        populate: {
            path: 'skills',
            select: '-skillCategory -__v -createdAt -updatedAt'
        }
    }
];

exports.newContract = async (req, res) => {
    const proposal = await Proposal.findById(req.body.proposalId);
    if(!proposal)return res.status(404).send(error(["cannot find proposal with given id"]));
    
    let job = await Job.findById(req.body.jobId);
    if(!job) return res.status(404).json(error(["cannot find job with given id"]));

    if(!_.includes(job.proposals.toString(), req.body.proposalId.toString())) return res.status(400).json(error(["cannot find given proposal id in the job"]));

    // if(!job.client.equals(req.user.client)) return res.status(401).json(error(["you are not the owner of job, cannot create contract"]));

    let checkContract = await Contract.find({'freelancer': req.user.freelancer, 'job': req.body.jobId});

    if(!_.isEmpty(checkContract)) return res.status(405).json(error(["contract already exist from given freelancer on this job"]));

    const contract = new Contract({
        client: req.user.client,
        job: req.body.jobId,
        freelancer: proposal.freelancer,
        proposal: req.body.proposalId,
        dueDate: req.body.dueDate,
        amount: req.body.amount,
        depositType: req.body.depositType,
        jobType: req.body.jobType
    });

    if(req.body.milestones){
        if(req.body.depositType == 'full' && req.body.milestones.length > 1) return res.status(405).json(error(["only one milestone can be added to full type contracts"]));

        let sum = 0;
        req.body.milestones.forEach((milestone) => {
            sum += milestone.amount;
        });
    
        if(sum > req.body.amount) return res.status(400).json(error(["total amount in milestone should not exceed the amount in contract"]));

        contract.milestones = req.body.milestones;
    }
    
    await contract.save();

    const contractResponse = await Contract.populate(contract, populateQuery);

    let response = {
        message: "Successfully created new contract",
        response: contractResponse
    }

    res.json(response);
}

exports.getContracts = async (req, res) => {
    let query = {};

    if(req.query.freelancerId) {
        if(!mongoose.Types.ObjectId.isValid(req.query.freelancerId)) return res.status(400).json(error(["invalid freelancer id"]));

        query.freelancer = req.query.freelancerId;
    }

    if(req.query.clientId) {
        if(!mongoose.Types.ObjectId.isValid(req.query.clientId)) return res.status(400).json(error(["invalid client id"]));

        query.client = req.query.clientId;
    }

    if(req.query.jobId) {
        if(!mongoose.Types.ObjectId.isValid(req.query.jobId)) return res.status(400).json(error(["invalid job id"]));

        query.jobId = req.query.jobId;
    }

    if(req.query.status) {
        let statusEnum = ['pending', 'rejected', 'active', 'completed'];
        if(!_.includes(statusEnum, req.query.status)) return res.status(400).json(error([`please send valid contract status ${statusEnum}`]));

        query.status = req.query.status;
    } 

    const contract = await filterAndPaginateV2(req.query.page, req.query.limit, Contract, query, '', populateQuery);

    const response = {
        message: "Contracts",
        meta: contract.meta,
        response: {
            results: contract.results
        }
    }

    res.json(response);
}

exports.getContractById = async (req, res) => {
    let contract = await Contract.findById(req.params.id).populate(populateQuery);
    if(_.isEmpty(contract)) return res.status(404).json(error(["cannot find contract with given id"]));

    let response = {
        message: `Contract id: ${req.params.id}`,
        response: contract
    }

    res.json(response);
}

exports.updateContract = async (req, res) => {
    // ! deactivating the contract update for now due to logical ambiguity
    return res.status(405).json(error(["contract update is deactivated, contact developer"]));

    let updateBody = {}
    if(req.body.amount) updateBody.amount = req.body.amount;
    if(req.body.dueDate) updateBody.dueDate = req.body.dueDate;

    //todo let client update contract only if contract is rejected by freelancer
    const checkContract = await Contract.findById(req.params.id);

    if(checkContract.status != 'rejected') return res.status(405).json(error(["only rejectd contracts can be updated"]));

    const contract = await Contract.findByIdAndUpdate(req.params.id, updateBody, {new: true}).populate(populateQuery);

    if(_.isEmpty(contract)) return res.status(404).json(error(["cannot find contract with given id"]));

    let response = {
        message: `Updated Contract id: ${req.params.id}`,
        response: contract
    }

    res.json(response);
}

exports.deleteContract = async (req, res) => {
    // ! deactivating the contract update for now due to logical ambiguity
    return res.status(405).json(error(["contract delete is deactivated, contact developer"]));

    const contract = await Contract.findByIdAndDelete(req.params.id);

    // todo  delete contract only if rejected.

    let response = {
        message: `Deleted Contract id: ${req.params.id}`,
        response: contract
    }

    res.json(response);
}

exports.setContractStatus = async (req, res) => {
    const contract = await Contract.findById(req.params.id);
    if(_.isEmpty(contract)) return res.status(404).json(error(["cannot find contract with given id"]));

    const job = await Job.findById(contract.job);

    const freelancer = await Freelancer.findById(req.user.freelancer);
    
    // * if current user's freelancer id is not equal to freelancer id in contract, he is not allowed to change contract status

    if(!(freelancer._id.equals(contract.freelancer))) return res.status(401).json(error(["unauthorized"]));

    if(contract.status === 'active') return res.status(405).json(error(["contract is already active"]));
    if(contract.status === 'rejected') return res.status(405).json(error(["contract is already rejected"]));

    if(req.body.status === 'active') {
        contract.status = 'active';
        job.status = 'ongoing';
        await Proposal.findByIdAndUpdate(contract.proposal, {status: 'hired'});
        // set other proposal to archive state

    } else if(req.body.status === 'rejected') {
        contract.status = 'rejected';
    } else {
        return res.status(400).json(error(["invalid contract status, contract status can be either active or rejected"]));
    }

    job.save();
    contract.save();

    let response = {
        message: `Contract ${contract.status}`,
        response: {}
    };
    
    res.json(response);
}