const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const Client = require('../models/Client');
const Job = require('../models/Job');
const Proposal = require('../models/Proposal');
const Contract = require('../models/Contract');
const FreelancerReview = require('../models/FreelancerReview');
const ClientReview = require('../models/ClientReview');

const error = require('../utils/error');

const _ = require('lodash');

// middlewares to check ownership of the resources

const unauthorisedError = (res) => {
    return res.status(403).json(error(["Unauthorised, you are not the owner of the resource."]));
}

exports.isUserOwner = function(req, res, next) {
    if(req.user._id != req.params.id) return unauthorisedError(res);
    next(); 
}

exports.isFreelancerOwner = async function(req, res, next) {
    const freelancer = await Freelancer.findById(req.params.id);

    if(req.user._id != freelancer.user) return unauthorisedError(res);
    next(); 
}

exports.isClientOwner = async function(req, res, next) {
    const client = await Client.findById(req.params.id);

    if(req.user._id != client.user) return unauthorisedError(res);
    next(); 
}

exports.isJobOwner = async function(req, res, next) {
    const job = await Job.findById(req.params.id);
    if(!job) res.status(404).json(error(["cannot find job"]));

    const client = await Client.findById(job.client);

    if(req.user._id != client.user) return unauthorisedError(res);
    next(); 
}

exports.isProposalOwner = async function(req, res, next) {
    const proposal = await Proposal.findById(req.params.id);
    console.log(proposal);
    console.log(req.params.id);
    if(!proposal) return res.status(404).json(error(["proposal not found"]));

    const freelancer = await Freelancer.findById(proposal.freelancer);

    if(req.user._id != freelancer.user) unauthorisedError(res);
    next(); 
}

// a freelancer is owner of client review
exports.isClientReviewOwner = async function(req, res, next) {
    const clientReview = await ClientReview.findById(req.params.id);
    const freelancer = await Freelancer.findById(clientReview.author.id);
    if(req.user._id != freelancer.user) unauthorisedError(res);
    next(); 
}

// a client is owner of freelancer review
exports.isFreelancerReviewOwner = async function(req, res, next) {
    const freelancerReview = await FreelancerReview.findById(req.params.id);
    const client = await Client.findById(freelancerReview.author.id);
    if(req.user._id != client.user) unauthorisedError(res);
    next(); 
}

// check job owner ship against job id provided in request body,
// user is not allowed to create contract if he is not owner of job, 
// only client can be owner of job, not freelancer

exports.isContractJobOwner = async function(req, res, next) {
    const job = await Job.findOne({'_id': req.body.jobId});

    if(!job) res.status(404).json(error(["cannot find job"]));

    if(!job.client.equals(req.user.client)) return unauthorisedError(res);

    next();
} 

// check if user is owner of contract or not
exports.isContractOwner = async function(req, res, next) {
    const contract = await Contract.findById(req.params.id);
    const user = await User.findById(req.user._id);

    console.log(contract);
    if(!contract) return res.status(404).json(error(["cannot find the job contract"]));

    if(!contract.client.equals(user.roles.client)) return unauthorisedError(res);

    next();
}

// only sender (client) and reciever (freelancer) can see the contract, not others

exports.isAuthorizedToViewContract = async function(req, res, next) {
    const contract = await Contract.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if(!contract) return res.status(404).json(error(["cannot find the job contract"]));
    
    if(! (contract.client.equals(user.roles.client) || contract.freelancer.equals(user.roles.freelancer))) 
    return unauthorisedError(res);

    next();
}

exports.isOnboardingOwner = async function(req, res, next) {
    if(req.user.freelancer != req.params.id) {
        return unauthorisedError(res);
    }

    next();
}