const Contract = require('@models/Contract');
const User = require('@models/User');
const Client = require('@models/Client');
const Job = require('@models/Job');
const FreelancerReview = require('@models/FreelancerReview');
const _ = require('lodash');
const filterAndPaginate = require('@middleware/filterAndPaginate');
const filterAndPaginateV2 = require('@middleware/filterAndPaginateV2');

const error = require('@utils/error');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getAllClients = async (req, res) => {
    const client = await Client.find({}).populate('user', 'profilePicture firstName lastName country');

    if(!client) {
        return res.status(404).send(error([`client not found by given id`]));
    }

    let response = {
        message: "All clients",
        response: {
            results: client
        }
    };
    
    res.json(response);
}

exports.getCurrentClient = async (req, res) => {
    const client = await Client.findOne({'user': req.user._id}).populate('user', 'profilePicture firstName lastName country');

    if(!client) {
        return res.status(404).send(error([`client not found by given id`]));
    }

    let response = {};
    response.message = `Client account ${client._id}`;
    response.response = client;
    
    res.json(response);
}

exports.getClientById = async (req, res) => {
    const client = await Client.findById(req.params.id).populate('user', 'profilePicture firstName lastName country');

    if(!client) {
        return res.status(404).send(error([`client not found by given id`]));
    }

    let response = {};
    response.message = `Client account ${req.params.id}`;
    response.response = client;

    res.json(response);
}

exports.updateClient = async (req, res) => {
    const updateBody = {}

    if(_.isEmpty(req.body)) return res.status(404).send(error([`cannot send empty body`]));

    if(req.body.companyWebsite) updateBody.companyWebsite = req.body.companyWebsite;
    if(req.body.profileDescription) updateBody.profileDescription = req.body.profileDescription;
    if(req.body.companyName) updateBody.companyName = req.body.companyName;

    const client = await Client.findByIdAndUpdate(req.user.client, req.body, {new: true}).populate('user', 'profilePicture firstName lastName');

    res.json({
        message: `Client account updated`,
        response: client
    })

}

// Extended routes

// Job
exports.getJobsByClientId = async (req, res) => {
    const client = await Client.findById({'_id': req.params.id});

    if(!client) {
        return res.status(404).send(error([`client not found by given id`]));
    }

    const query = {
        client: req.params.id
    }

    let amount = 0;
    let skills = [];
    let durationRange = [];
    let skillCategories = [];

    if(req.query.amount) {amount = JSON.parse(req.query.amount);}
    if(req.query.skills) {skills = JSON.parse(req.query.skills);}
    if(req.query.skillCategories) {skillCategories = JSON.parse(req.query.skillCategories);}
    if(req.query.durationRange) {durationRange = JSON.parse(req.query.durationRange);}
    
    if(req.query.duration && req.query.durationRange) return res.status(400).json(error(["use either duration or durationRange as query parameter, not both"]));

    if(req.query.skills && req.query.skillCategories) return res.status(400).json(error(["only one filter can be applied, skills or skill categories, not both"]));

    if(!_.isArray(skills)) return res.status(400).json(error(["skill has to be an array for query parameter"]));

    if(!_.isArray(skillCategories)) return res.status(400).json(error(["skillCategories has to be an array for query parameter"]));

    if(req.query.duration) query.duration = req.query.duration;
    if(req.query.durationRange) query.duration = {$gte: durationRange[0], $lt: durationRange[1]};
    if(req.query.level) query.expertiseLevel = req.query.level;
    if(req.query.amount) query.amount = {$gte: amount[0], $lt: amount[1]};
    if(req.query.skills) query.skills = {"$in" : skills};
    if(req.query.skillCategories) query.skills = {"$in": skillCategories}

    if(req.query.status) {
        if(_.includes(['open', 'ongoing', 'completed'], req.query.status)) {
            query.status = req.query.status
        } else {
            return res.status(400).json(error(["job status can be either open, ongoing or completed"]));
        }
    } 

    const populateQuery = [{path: 'skills', select: '_id title'}, {path: 'client', populate: {path: 'user', select: 'firstName lastName country profilePicture'}}]

    const results = await filterAndPaginateV2(req.query.page, req.query.limit, Job, query, '-contracts -skillCategories', populateQuery);

    // const response = {
    //     message: "Jobs",
    //     meta: results.meta,
    //     response: {
    //         results: results.results
    //     }
    // }

    // const results = await filterAndPaginate(req.query.page, req.query.limit, Job, query, '-contracts', 
    // 'skills', '_id title');



    let response = {
        message: `Jobs of client ${req.params.id}`,
        meta: results.meta,
        response: {
            results: results.results
        }
    };

    res.json(response); 
}

exports.getReviewsByClientId = async (req, res) => {
    const query = {};
    let rating = [];

    if(req.query.rating) {rating = JSON.parse(req.query.rating);}

    if(!req.params.id) return res.status(400).json(error(["please provide client id"]))
    
    query['author.id'] = req.params.id;

    if(req.query.rating) {
        query.rating = {$gte: rating[0], $lt: rating[1]}
    }

    const results = await filterAndPaginate(req.query.page, req.query.limit, FreelancerReview, query, null, 
    null, null);

    const response = {
        message: `Reviews to freelancer ${req.params.id}`,
        meta: results.meta,
        response: {
            results: results.results
        }
    }

    res.json(response);
}

exports.getCurrentUserWallet = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]));

    const client = await Client.findById(user.roles.client);

    if(!client) {
        return res.status(404).send(error([`client not found by given id`]));
    }

    let response = {};
    response.message = `Wallet details of client ${client._id}`;
    response.response = client.wallet;

    res.json(response); 
}

// TODO make function as requestBody -> pass an object
// TODO move stripe functions to different files 
const stripeCharge = (user, token, amount, description, callback) => {
    return stripe.charges
      .create({
        customer: user.stripeId,
        amount: amount * 100,
        currency: 'usd',
        description: description,
        receipt_email: user.email,
        shipping: {
          name: token.card.name,
          address: {
            country: user.country
          },
        }      
      })
      .then(async (result) => {
        callback(result);        
      })
      .catch((err) => {
        console.log(err);
    });
}

exports.rechargeWallet = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]));

    const amount = req.body.amount;

    if(!user.stripeId) {
        return stripe.customers
        .create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            source: req.body.token.card.id,
            address: {
              country: req.user.country,
            },
            metadata: {
                user: user._id.toString()
            }
        }).then(async (customer) => {
            const user = await User.findById(req.user._id);
            user.stripeId = customer.id;
            user.save();

            stripeCharge(user, req.body.token, amount, `wallet recharge for for amount: ${amount}`, async (result) => {
                const client = await Client.findById(user.roles.client);
                client.wallet.balance += amount;
                const paymentResponse = {
                    amount: result.amount/100,
                    paymentMethod: result.payment_method,
                    receiptUrl: result.receipt_url,
                    transactionId: result.id,
                    description: result.description,
                    status: result.status
                }
        
                client.wallet.rechargeHistory.push(paymentResponse);
                client.save();
                res.json(paymentResponse);
            });
        })
    }

    stripeCharge(user, req.body.token, amount, `wallet recharge for for amount: ${amount}`, async (result) => {
        const client = await Client.findById(user.roles.client);
        client.wallet.balance += amount;
        const paymentBody = {
            amount: result.amount/100,
            paymentMethod: result.payment_method,
            receiptUrl: result.receipt_url,
            transactionId: result.id,
            description: result.description,
            status: result.status
        }

        client.wallet.rechargeHistory.push(paymentBody);
        client.save();
        res.json(paymentBody);
    });
}








