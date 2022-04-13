const Freelancer = require('@models/Freelancer');
const Client = require('@models/Client');
const FreelancerReview = require('@models/FreelancerReview');
const filterAndPaginate = require('@middleware/filterAndPaginate');
const mongoose = require('mongoose');
const User = require('@models/User');
const _ = require('lodash');

const error = require("@utils/error");

exports.newReview = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]))

    const freelancer = await Freelancer.findById(req.body.freelancerId);
    if(!freelancer) return res.status(404).json(error(["freelancer not found"]))

    const client = await Client.findById(user.roles.client);
    if(!client) return res.status(404).json(error(["client not found"]))

    // if(freelancer.user.equals(client.user)) return res.status(405).json(error(["Client and freelancer account of same user can not interact with each other"]));

    const reviewBody = {
        'freelancer': freelancer._id,

        'author': {
            id: user.roles.client,
            name: user.firstName,
            country: user.country,
            profilePicture: user.profilePicture,
            companyName: client.companyName ? client.companyName : null
        },

        'body': req.body.body,
        'rating': req.body.rating,
    }

    let freelancerReview = new FreelancerReview(reviewBody);
    await freelancerReview.save();

    if(freelancer.rating == 0) {
        freelancer.rating = req.body.rating
    } else {
        freelancer.rating = ((freelancer.rating + parseInt(req.body.rating))/2).toFixed(1)
    }

    freelancer.save();

    res.json({
        message: `Successfully created a review for freelancer ${req.body.freelancerId}`,
        response: freelancerReview
    });
}

exports.getReview = async (req, res) => {
    const query = {};
    let rating = [];

    if(req.query.rating) {rating = JSON.parse(req.query.rating);}

    if(!req.query.freelancerId || req.query.freelancerId == 'undefined') return res.status(400).json(error(["please provide freelancer id"]));

    if(req.query.freelancerId) {
        if(!mongoose.Types.ObjectId.isValid(req.query.freelancerId)) return res.status(400).json(error(["invalid freelancer id"]));

        query.freelancer = req.query.freelancerId;
    }
    
    query.freelancer = req.query.freelancerId;

    if(req.query.rating) {
        query.rating = {$gte: rating[0], $lt: rating[1]}
    }

    const results = await filterAndPaginate(req.query.page, req.query.limit, FreelancerReview, query, null, 
    null, null);

    const response = {
        message: `Reviews to freelancer ${req.query.freelancerId}`,
        meta: results.meta,
        response: {
            results: results.results
        }
    }

    res.json(response);
}

exports.getSingleReview = async (req, res) => {
    const freelancerReview = await FreelancerReview.find({'_id': req.params.id});

    if(!freelancerReview || _.isEmpty(freelancerReview)) return res.status(404).json(error(["review not found"]));

    res.json({
        message : `Review id: ${req.params.id}`,
        response: freelancerReview
    }); 
}

exports.updateReview = async (req, res) => {
    // const freelancerReview = await FreelancerReview.findByIdAndUpdate(req.params.id, _.pick(req.body, ['body', 'rating']), {new: true});

    // let response = {};
    // response.message = `Updated review id: ${req.params.id}`;
    // response.response = freelancerReview;

    res.json({
        message: "once review created, it cannnot be deleted or edited"
    }); }

exports.deleteReview = async (req, res) => {
    // const freelancerReview = await FreelancerReview.findByIdAndDelete(req.params.id);
    // if(!freelancerReview || _.isEmpty(freelancerReview)) return res.status(404).json(error(["Freelancer Review  not found"]));

    // await Freelancer.findByIdAndUpdate(freelancerReview.freelancerId, {$pull : {'reviews': req.params.id}});

    // let response = {};
    // response.message = `Deleted review id: ${req.params.id}`;
    // response.response = freelancerReview;

    res.json({
        message: "once review created, it cannnot be deleted or edited"
    }); 
}