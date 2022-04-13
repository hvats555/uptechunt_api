const mongoose = require('mongoose');
const User = require('@models/User');
const Freelancer = require('@models/Freelancer');
const Client = require('@models/Client');
const Job = require('@models/Job');
const Proposal = require('@models/Proposal');
const _ = require('lodash');
const filterAndPaginateV2 = require('@middleware/filterAndPaginateV2');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const error = require('@utils/error');

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
        path: 'job',
        select: '-proposals -contracts -skillCategories',
        populate: [{
            path: 'skills',
            select: '_id title description'
        }, {
            path: 'client',
            select: '_id user',
            populate: {
                path: 'user',
                select: 'profilePicture firstName lastName country'
            }
        }]
    }
];

exports.newProposal = async (req, res) => {
    const user = await User.findById(req.user._id);

    const freelancer = await Freelancer.findById(user.roles.freelancer).populate('user', 'profilePicture firstName lastName country').exec();

    if(freelancer.subscription) {
        if(freelancer.subscription.remainingProposalCount === 0) return res.status(405).json(error(["you have used you proposal credit limit for this month, wait for next billing period or upgrade your plan"]));
    }

    if (!mongoose.Types.ObjectId.isValid(req.body.jobId)) return res.status(400).json(error(["invalid job id"]));
    let job = await Job.findById(req.body.jobId);
    if(!job) return res.status(404).json(error(["cannot find job"]));

    if (!(_.isUndefined(job.status)) && (job.status == 'closed' || job.status == 'ongoing')) return res.status(405).json(error(["can not send proposals to closed or ongoing job"]));

    const client = await Client.findById(job.client);
    
    if (client) {
        if (client.user.equals(user._id)) return res.status(405).json(error(["freelancer cannot send proposal to job of client related to same user"]));
    }

    // !!! make sure to re enable it later, OTP ALSO
    // freelancer cannot send more than one proposal per job
    let proposal = await Proposal.find({'freelancer': user.roles.freelancer, 'jobId': req.body.jobId});

    if(!_.isEmpty(proposal)) return res.status(405).json(error(["proposal already exist from given freelancer on this job"]));

    const proposalBody = {
        bidAmount: parseInt(req.body.bidAmount),
        freelancer: user.roles.freelancer,
        job: req.body.jobId,
        coverLetter: req.body.coverLetter,
        duration: parseInt(req.body.duration),
        attachments: req.body.attachments
    }

    proposal = new Proposal(proposalBody);

    // sum of the milestones should be equal to total contract amount
    if(req.body.milestones && req.body.milestones.length > 0) {
        console.log(req.body.milestones)
        let sum = 0;
        req.body.milestones.forEach((milestone) => {
            sum += parseInt(milestone.amount);
        });
        
        proposal.bidAmount = sum;
    
        proposal.milestones = req.body.milestones;
    }

    await proposal.save();

    await Job.findByIdAndUpdate(req.body.jobId, { $push: { 'proposals': proposal._id } });

    freelancer.subscription.remainingProposalCount -= 1;
    freelancer.save();

    const proposalResponse = await Proposal.populate(proposal, populateQuery);

    let response = {
        message: "Proposal successfully created",
        response: proposalResponse
    };

    res.json(response);
}

// get all proposal -> make it get proposal by job id
exports.getProposal = async (req, res) => {
    // /api/proposals?page=1&limit=10&jobId=123&freelancer=435
    let query = {};

    if(!req.query.jobId && !req.query.freelancerId) return res.status(400).json(error(["provide freelancer id or job id as query parameter"]));

    if(req.query.jobId) {
        if(!mongoose.Types.ObjectId.isValid(req.query.jobId)) return res.status(400).json(error(["invalid job id"]));
        query.job = req.query.jobId;
    }

    if(req.query.freelancerId) { 
        if(!mongoose.Types.ObjectId.isValid(req.query.freelancerId)) return res.status(400).json(error(["invalid freelancer id"]));
        query.freelancer = req.query.freelancerId;
    }

    if(req.query.status) { 
        if(!_.includes(['open', 'rejected', 'interviewing', 'hired', 'archived'], req.query.status)) return res.status(400).json(error(["invalid status"]));
        query.status = req.query.status;
    }

    const results = await filterAndPaginateV2(req.query.page, req.query.limit, Proposal, query, '', populateQuery);

    const response = {
        message: "Proposals",
        meta: results.meta,
        response: {
            results: results.results
        }
    }

    res.json(response);
}

// display single proposal 
exports.getProposalById = async (req, res) => {
    let proposal = await Proposal.findOne({ '_id': req.params.id }).populate(populateQuery);
    if (!proposal || _.isEmpty(proposal)) return res.status(404).json(error(["proposal not found"]));

    let response = {};      
    response.message = `Proposal id: ${req.params.id}`;
    response.response = proposal;

    res.json(response);
}

// updating info in proposal 
exports.updateProposal = async (req, res) => {
    const proposalBody = {
        bidAmount: parseInt(req.body.bidAmount),
        freelancer: req.user.freelancer,
        coverLetter: req.body.coverLetter,
        duration: parseInt(req.body.duration),
        attachments: req.body.attachments
    }

    // sum of the milestones should be equal to total contract amount
    if(req.body.milestones && req.body.milestones.length > 0) {
        let sum = 0;
        req.body.milestones.forEach((milestone) => {
            sum += parseInt(milestone.amount);
        });
        
        proposalBody.bidAmount = sum;
    
        proposalBody.milestones = req.body.milestones;
    }

    let proposal = await Proposal.findByIdAndUpdate(req.params.id, proposalBody, { new: true }).populate(populateQuery);

    let response = {};
    response.message = `Updated proposal id: ${req.params.id}`;
    response.response = proposal;

    res.json(response);
}

// delete proposal
exports.deleteProposal = async (req, res) => {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);
    if (!proposal || _.isEmpty(proposal)) return res.status(404).json(error(["proposal not found"]));

    await Job.findByIdAndUpdate(proposal.job, { $pull: { 'proposals': req.params.id } });
    
    let response = {};
    response.message = `Deleted proposal id: ${req.params.id}`;
    response.response = proposal;

    res.json(response);
}

// proposal recharge

exports.proposalRecharge = async (req, res) => {
    const user = await User.findById(req.user._id);
    const freelancer = await Freelancer.findOne({user: req.user._id});
    // ? where to get products?
    // ? from our own database OR stripe database ?

    const product = {
        price: 1.99,
        proposals: 30,
        description: '30 proposals @ 1.99'
    }

    await stripe.paymentIntents.create({
        payment_method_types: ['card'],
        customer: user.stripeId,
        amount: product.price * 100,
        currency: 'usd',
        description: `Proposal recharge of ${product.proposals} for freelancer: ${freelancer._id}`,
        metadata: {
            proposals: product.proposals.toString(),
            freelancer: freelancer._id.toString(),
            type: 'proposal_recharge'
        }
        }).then(async (response) => {
            const ephemeralKey = await stripe.ephemeralKeys.create(
                { customer: user.stripeId },
                { apiVersion: '2020-08-27' }
            );

            res.json({
                message: "Payment intent client secret",
                response: {
                    customerId: user.stripeId,
                    ephemeralKey: ephemeralKey.secret,
                    client_secret: response.client_secret
                }
            });
        }).catch((err) => {
            res.status(400).json(error([err.message]));
        });
}

