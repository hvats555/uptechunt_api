const Client = require('@models/Client');
const Freelancer = require('@models/Freelancer');
const mongoose = require('mongoose');
const Skill = require('@models/Skill');
const Job = require('@models/Job');
const User = require('@models/User');
const Proposal = require('@models/Proposal');
const _ = require('lodash');

const error = require('@utils/error');

const filterAndPaginate = require('@middleware/filterAndPaginate');
const filterAndPaginateV2 = require('@middleware/filterAndPaginateV2');

exports.newJob = async (req, res) => {
    const user = await User.findById(req.user._id);
    
    if(!user) return res.status(404).send("User not available");
    
    const skillIds = req.body.skills;
    let skill;
    let skillCategories = [];

    for(let i=0; i<skillIds.length; i++) {
        if(!mongoose.Types.ObjectId.isValid(skillIds[i])) { 
            return res.status(400).json(error([`invalid skill id ${skillIds[i]}`]));
        }

        skill = await Skill.findById(skillIds[i]);
        if(!skill){
            return res.status(400).send(error([`cannot find skill with id: ${skillIds[i]}`]));
        }
        skillCategories.push(skill.skillCategory.toString())

    }

    // look for kill categorie ids

    let job = new Job({
        client: user.roles.client,
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        amount: req.body.amount,
        duration: req.body.duration,
        expertiseLevel: req.body.expertiseLevel,
        skillCategories: _.uniq(skillCategories),
        skills: skillIds,
        jobType: req.body.jobType
    })

    if(req.body.attachments) job.attachments = req.body.attachments

    job = await job.save();

    const populateQuery = [{path: 'skills', select: '_id title'}, {path: 'client', populate: {path: 'user', select: 'firstName lastName country profilePicture'}}]

    job = await Job.findById(job._id).populate(populateQuery).exec();

    let response = {};
    response.message = "Job successfully created";
    response.response = job;

    res.json(response);
}

exports.getJobs = async (req, res) => {
    const client = await Client.findOne({user: req.user._id});
    if(!client) return res.status(400).json(error(["client not found"]));

    let query = {};
    let amount = 0;
    let skills = [];
    let durationRange = [];
    let skillCategories = [];

    if(req.query.amount) {amount = JSON.parse(req.query.amount);}
    if(req.query.skills) {skills = JSON.parse(req.query.skills);}
    if(req.query.skillCategories) {skillCategories = JSON.parse(req.query.skillCategories);}
    if(req.query.durationRange) {durationRange = JSON.parse(req.query.durationRange);};
    
    if(req.query.duration && req.query.durationRange) return res.status(400).json(error(["use either duration or durationRange as query parameter, not both"]));

    if(req.query.skills && req.query.skillCategories) return res.status(400).json(error(["only one filter can be applied, skills or skill categories, not both"]));

    if(!_.isArray(skills)) return res.status(400).json(error(["skill has to be an array for query parameter"]));

    if(!_.isArray(skillCategories)) return res.status(400).json(error(["skillCategories has to be an array for query parameter"]));
    
    query.client = {$ne: client._id}; // excluding self jobs
    if(req.query.duration) query.duration = req.query.duration;
    if(req.query.durationRange) query.duration = {$gte: durationRange[0], $lt: durationRange[1]};
    if(req.query.level) query.expertiseLevel = req.query.level;
    if(req.query.amount) query.amount = {$gte: amount[0], $lt: amount[1]};
    if(req.query.skills) query.skills = {"$in" : skills};
    if(req.query.skillCategories) query.skills = {"$in": skillCategories}

    if(req.query.searchString) query.$text = {'$search': req.query.searchString};

    if(req.query.jobType) {
        if(_.includes(['hourly', 'fixed'], req.query.jobType)) {
            query.jobType = req.query.jobType

        } else {
            return res.status(400).json(error(["job type can be either hourly or fixed"]));
        }
    } 

    if(req.query.status) {
        if(_.includes(['open', 'ongoing', 'completed'], req.query.status)) {
            query.status = req.query.status
        } else {
            return res.status(400).json(error(["job status can be either open, ongoing or completed"]));
        }
    } 

    // const results = await filterAndPaginate(req.query.page, req.query.limit, Job, query, '-contracts -skillCategories', 
    // 'skills client', '_id title');

    const populateQuery = [{path: 'skills', select: '_id title'}, {path: 'client', populate: {path: 'user', select: 'firstName lastName country profilePicture'}}]

    const results = await filterAndPaginateV2(req.query.page, req.query.limit, Job, query, '-contracts -skillCategories', populateQuery);

    const response = {
        message: "Jobs",
        meta: results.meta,
        response: {
            results: results.results
        }
    }

    res.json(response);
}

exports.getJobById = async (req, res) => {
    const populateQuery = [
        {  
            path: 'skills',
            select: '_id title'
        },

        {  
            path: 'client',
            select: '_id user totalSpent rating createdAt',
            populate: {
                path: 'user',
                select: 'profilePicture firstName lastName country'
            }
        }
    ];


    const job = await Job.findOne({'_id': req.params.id}).select("-skillCategories").populate(populateQuery).exec();
    if(!job || _.isEmpty(job)) return res.status(404).json(error(["cannot find job"]));

    let response = {};
    response.message = `Job id : ${req.params.id}`;
    response.response = job;

    res.json(response);
}

exports.updateJob = async (req, res) => {
    const user = await User.findById(req.user._id);

    if(!user) return res.status(404).json(error(["user not available"]));

    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {new: true});
    
    let response = {};
    response.message = `Updated Job id : ${req.params.id}`;
    response.response = job;

    res.json(response);
}

exports.deleteJob = async (req, res) => {
    const job = await Job.findByIdAndDelete(req.params.id);
    if(!job) return res.status(404).json(error(["cannot find job"]));

    await Client.findByIdAndUpdate(job._id, {$pull : {'jobs': req.params.id}});
    
    let response = {};
    response.message = `Deleted job id : ${req.params.id}`;
    response.response = job;

    res.json(response);
}

exports.completeJob = async (req, res) => {
    const job = await Job.findByIdAndUpdate(req.params.id, {status: 'completed'}, {new: true});

    if(!job) return res.status(404).json(error(["cannot find job"]));

    let response = {
        message: `Job status changed to completed`,
        response: job
    }
    
    res.json(response);
}

// /api/job/:id/proposals/:freelancer

exports.getProposalsByJobId = async (req, res) => {
    let proposal = await Proposal.find({'jobId': req.params.id}).sort('-createdAt');

    if(!proposal) res.status(404).send(error(["cannot find proposals"]));

    proposal = JSON.stringify(proposal);
    proposal = JSON.parse(proposal);

    for(let i=0; i<proposal.length; i++){
        let freelancer = await Freelancer.findById(proposal[i].freelancer).select('hourlyPrice rating totalEarnings user').populate('user', 'profilePicture firstName lastName country').exec();
        proposal[i].freelancer = freelancer;
    }

    const response = {
        message: `proposals for job ${req.params.id}`,
        response: {
            results: proposal
        }
    };

    res.json(response);
}


// exports.jobFeed = async (req, res) => {
//     const freelancer = await Freelancer.findById(req.user.freelancer);
    
//     let query = {};

//     query.status = {$ne: 'completed'}; // excluding completed jobs

//     if(freelancer.skills.length != 0) query.skills = {"$in": freelancer.skills}

//     const results = await filterAndPaginate(req.query.page, req.query.limit, Job, query, '-contract', 
//     'skills', '_id title');

//     const response = {
//         message: "Jobs",
//         meta: results.meta,
//         response: {
//             results: results.results
//         }
//     }

//     res.json(response);
// }