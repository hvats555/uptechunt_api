const mongoose = require('mongoose');
const User = require('@models/User');
const filterAndPaginate = require('@middleware/filterAndPaginate');
const Freelancer = require('@models/Freelancer');
const Client = require('@models/Client');
const Contract = require('@models/Contract');
const Proposal = require('@models/Proposal');
const Skill = require('@models/Skill');
const SkillCategory = require('@models/SkillCategory');
const Wallet = require('@models/Wallet');
const _ = require('lodash');
const error = require('@utils/error');
const ClientReview = require('@models/ClientReview');


exports.getCurrentUserFreelancer = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]));

    let freelancer = await Freelancer.findOne({'user': req.user._id}).populate('user', 'firstName lastName profilePicture country').populate('mainSkillCategory', 'image _id title').populate('skills', 'title _id').exec();
    
    let response = {
        message: `Freelancer account: ${freelancer._id}`,
        response: freelancer
    };

    res.json(response); 
}

exports.getFreelancers = async (req, res) => {
    let query = {};

    // ! handle the types and errors in the entire applicaiton
    if(req.query.approved) {
        // check if boolean of not
        query.isProfileApproved = req.query.approved;
    }

    if(req.query.language) {
        let language = JSON.parse(req.query.language);
        query.language = {"$in": language};
    }

    if(req.query.hourlyPrice) {
        let hourlyPrice = JSON.parse(req.query.hourlyPrice);
        query.hourlyPrice = {$gte: hourlyPrice[0], $lt: hourlyPrice[1]};
    }

    if(req.query.rating) {
        let rating = JSON.parse(req.query.rating);
        query.rating = {$gte: rating[0], $lt: rating[1]};
    }

    if(req.query.totalEarnings) {
        let totalEarnings = JSON.parse(req.query.totalEarnings);
        query.totalEarnings = {$gte: totalEarnings[0], $lt: totalEarnings[1]};
    }

    if(req.query.skills && req.query.skillCategories) return res.status(400).json(error(["only one filter can be applied, skills or skill categories, not both"]));

    if(req.query.skills) {
        let skills = JSON.parse(req.query.skills);

        if(!_.isArray(skills)) return res.status(400).json(error(["skill has to be an array for query parameter"]));

        const skillIds = JSON.parse(req.query.skills);
        let skill;
    
        for(let i=0; i<skillIds.length; i++) {
            if(!mongoose.Types.ObjectId.isValid(skillIds[i])) return res.status(400).json(error([`invalid skill id ${skillIds[i]}`]));
    
            skill = await Skill.findById(skillIds[i]);
            if(!skill){
                return res.status(400).send(error([`cannot find skill with id: ${skillIds[i]}`]));
            }
        }

        query.skills = {"$in" : skills};
    }

    if(req.query.skillCategories) {
        let skillCategories = JSON.parse(req.query.skillCategories);

        if(!_.isArray(skillCategories)) return res.status(400).json(error(["skillCategories has to be an array for query parameter"]));

        const skillCategoryIds = JSON.parse(req.query.skillCategories);
        let skill;
    
        for(let i=0; i<skillCategoryIds.length; i++) {
            if(!mongoose.Types.ObjectId.isValid(skillCategoryIds[i])) return res.status(400).json(error([`invalid skill id ${skillCategoryIds[i]}`]));
    
            skill = await SkillCategory.findById(skillCategoryIds[i]);
            if(!skill){
                return res.status(400).send(error([`cannot find skill with id: ${skillCategoryIds[i]}`]));
            }
        }

        query.skillCategories = {"$in" : skillCategories};
    }

    const results = await filterAndPaginate(req.query.page, req.query.limit, Freelancer, query, '', 
    'skills user mainSkillCategory', '_id title profilePicture firstName lastName country');

    const response = {
        message: "Freelancers",
        meta: results.meta,
        response: {
            results: results.results
        }
    }

    res.json(response);
}

exports.getFreelancerById = async (req, res) => {
    const freelancer = await Freelancer.findById(req.params.id).populate('user', 'profilePicture firstName lastName country pubnubUUID').populate('mainSkillCategory', 'image _id title').populate('skills', 'title _id').exec();

    if(!freelancer) return res.status(404).json(error(["freelancer not found"]));

    const response = {
        message: `details of freelancer ${req.params.id}`,
        response: freelancer
    }

    res.json(response);
}

exports.updateFreelancer = async (req, res) => {
    const user = await User.findById(req.user._id);
    let skillCategories = [];

    if(req.body.skills) {
        const skillIds = req.body.skills;
        let skill;
    
        for(let i=0; i<skillIds.length; i++) {
            if(!mongoose.Types.ObjectId.isValid(skillIds[i])) return res.status(400).json(error([`invalid skill id ${skillIds[i]}`]));
    
            skill = await Skill.findById(skillIds[i]);
            
            if(!skill){
                return res.status(400).send(error([`cannot find skill with id: ${skillIds[i]}`]));
            }
            
            skillCategories.push(skill.skillCategory.toString())
        }
    }
    
    req.body.skillCategories = _.uniq(skillCategories)

    if(req.body.mainSkillCategory) {
        if(!mongoose.Types.ObjectId.isValid(req.body.mainSkillCategory)) return res.status(400).json(error([`invalid main skill id`]));
        
        const skillCategory = await SkillCategory.findById(req.body.mainSkillCategory);

        if(!skillCategory) {
            return res.status(400).json(error([`main skill category not found in the records`]));
        }
    }

    console.log(req.body);


    let freelancer = await Freelancer.findByIdAndUpdate(user.roles.freelancer, req.body, {new: true}).select('-skillCategories').populate('user', 'profilePicture firstName lastName country').populate('skills', 'title _id').populate('mainSkillCategory', 'image _id title').exec();

    let response = {};
    response.message = `Updated Freelancer account: ${freelancer._id}`;
    response.response = freelancer;

    res.json(response);
}

// extended routes

exports.getReviewsByFreelancerId = async (req, res) => {
    const query = {};
    let rating = [];

    if(req.query.rating) {rating = JSON.parse(req.query.rating);}

    if(!req.params.id) return res.status(400).json(error(["please provide freelancer id"]))
    
    query['author.id'] = req.params.id;

    if(req.query.rating) {
        query.rating = {$gte: rating[0], $lt: rating[1]}
    }

    const results = await filterAndPaginate(req.query.page, req.query.limit, ClientReview, query, null, 
    null, null);

    const response = {
        message: `Reviews to client ${req.params.id}`,
        meta: results.meta,
        response: {
            results: results.results
        }
    }

    res.json(response);
}
// get /api/proposals?jobId=123&freelancer=432
exports.getProposalsByFreelancerId = async (req, res) => {
    let proposal = await Proposal.find({freelancer: req.params.id});
    if(!proposal) return res.status(404).json(error(["proposals not found"]));

    proposal = JSON.stringify(proposal);
    proposal = JSON.parse(proposal);

    for(let i=0; i < proposal.length; i++){
        let freelancer = await Freelancer.findById(proposal[i].freelancer).select('hourlyPrice rating totalEarnings user').populate('user', 'profilePicture firstName lastName country').exec();

        proposal[i].freelancer = freelancer;
    }

    const response = {
        message: `proposals of freelancer account: ${req.params.id}`,
        response: {
            results: proposal
        }
    }

    res.json(response); 
}

exports.getCurrentUserWallet = async (req, res) => {
    const populateQuery = [
        {  
            path: 'freelancer',
            select: '_id'
        },

        {
            path: 'transaction',
            populate: [{
                path: 'contract',
                select: '_id'
            }]
        }
    ];

    const freelancer = await Freelancer.findById(req.user.freelancer);
    if(!freelancer) return res.status(404).json(error(["freelancer not found"]));

    const wallet = await Wallet.findOne({freelancer: freelancer._id}).populate(populateQuery);
    if(!wallet) return res.status(404).json(error(["wallet not found"]));

    res.json({
        message: `Wallet details of freelancer ${freelancer._id}`,
        response: wallet
    });
}