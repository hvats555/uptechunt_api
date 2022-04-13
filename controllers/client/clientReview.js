const mongoose = require('mongoose');
const Client = require('@models/Client');
const Freelancer = require('@models/Freelancer');
const User = require('@models/User');
const ClientReview = require('@models/ClientReview');
const _ = require('lodash');
const filterAndPaginate = require('@middleware/filterAndPaginate');

const error = require("@utils/error");

// new clientReview 
exports.newReview = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).send("User account not found");

    const client = await Client.findById(req.body.clientId);

    if(!client) return res.status(404).json(error(["client account not found"]))

    freelancer = await Freelancer.findById(user.roles.freelancer);

    // if (freelancer) {
    //     if(freelancer.user.equals(client.user)) return res.status(405).json(error(["freelancer and client belonging to same user cannot interact with each other"]));
    // }

    const reviewBody = {
        'client': client._id,

        'author': {
            id: user.roles.freelancer,
            name: user.firstName,
            country: user.country
        },

        'body': req.body.body,
        'rating': req.body.rating,
    }

    let clientReview = new ClientReview(reviewBody);
    await clientReview.save();

    // update ratings.

    if(client.rating == 0) {
        client.rating = req.body.rating
    } else {
        client.rating = ((client.rating + parseInt(req.body.rating))/2).toFixed(1)
    }

    client.save();

    res.json({
        message: `Successfully created a review for client ${req.body.clientId}`,
        response: clientReview
    });
}

exports.getReview = async (req, res) => {
    const query = {};
    let rating = [];

    if(req.query.rating) {rating = JSON.parse(req.query.rating);}

    if(!req.query.clientId) return res.status(400).json(error(["please provide client id"]))

    if(req.query.clientId) {
        if(!mongoose.Types.ObjectId.isValid(req.query.clientId)) return res.status(400).json(error(["invalid clientId id"]));
    }
    
    query.client = req.query.clientId;

    if(req.query.rating) {
        query.rating = {$gte: rating[0], $lt: rating[1]}
    }

    const results = await filterAndPaginate(req.query.page, req.query.limit, ClientReview, query, null, 
    null, null);

    const response = {
        message: `Reviews to client ${req.query.clientId}`,
        meta: results.meta,
        response: {
            results: results.results
        }
    }

    res.json(response);
}

exports.getReviewById = async (req, res) => {
    const clientReview = await ClientReview.find({'_id': req.params.id});

    if(!clientReview || _.isEmpty(clientReview)) return res.status(404).json(error(["review not found"]));

    res.json({
        message : `Review id: ${req.params.id}`,
        response: clientReview
    }); 
}

exports.updateReview = async (req, res) => {
    // const clientReview = await ClientReview.findByIdAndUpdate(req.params.id, _.pick(req.body, ['body', 'rating']), {new: true});

    // res.json({
    //     message : `Updated review id: ${req.params.id}`,
    //     response: clientReview
    // }); 
    res.json({
        message: "once review created, it cannnot be deleted or edited"
    }); 
}

exports.deleteReview = async (req, res) => {
    // const clientReview = await ClientReview.findByIdAndDelete(req.params.id);
    // if(!clientReview || _.isEmpty(clientReview)) return res.status(404).json(error(["client review not found"]));

    // await Client.findByOneAndUpdate(clientReview.clientId, {$pull : {'reviews': req.params.id}});
    
    // let response = {};
    // response.message = `Deleted review id: ${req.params.id}`;
    // response.response = clientReview;

    res.json({
        message: "once review created, it cannnot be deleted or edited"
    }); 
}