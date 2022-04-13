const mongoose = require('mongoose');
const Contract = require('@models/Contract');
const _ = require('lodash');

const error = require("@utils/error");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('@models/User');

exports.newMilestone = async (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.contractId)) return res.status(400).json(error(["invalid object id"]));

    const milestoneBody = {
        description: req.body.description,
        amount: req.body.amount,
        dueDate: req.body.dueDate
    }

    const query = {
        $push: { milestones: milestoneBody },
        $inc: { amount: milestoneBody.amount }
    }

    const checkContract = await Contract.findById(req.params.contractId);
    if(!checkContract) return res.status(404).json(error(["contract not found"]));

    if(checkContract.depositType == 'full') return res.status(405).json(error(["no new milestones can be added to full type contracts"]));

    const contract = await Contract.findByIdAndUpdate(req.params.contractId, query, {new: true});

    let response = {
        message: "Miestone successfully added",
        response: contract
    }

    res.json(response);
}

// todo milestone activation

exports.milestoneFundingPaymentIntent = async (req, res) => {
    const user = await User.findById(req.user._id);

    const { milestoneId } = req.params;
    const contract = await Contract.findOne({milestones: {$elemMatch : {_id: milestoneId}}});
    if(!contract) return res.status(404).json(error(["no contract found with given milestone id"]));

    // if(!contract.client.equals(req.user.client)) return res.status(401).json(error(["not authorized"]));

    let milestone = contract.milestones.find(milestone => milestone._id == milestoneId);

    if(milestone.status == 'active') return res.status(405).json(error(["milestone is already funded"]));

    contract.milestones.forEach(milestone => {
        if(milestone.status == 'active') return res.status(405).json(error(["one milestone is already active"]));
    });

    console.log(user);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: milestone.amount * 100,
        currency: 'usd',
        customer: user.stripeId,
        payment_method_types: ['card'],
        metadata: {
            'type': 'milestone_funding',
            'contractId': contract._id.toString(),
            'milestoneId': milestone._id.toString(),
            'milestoneAmount': milestone.amount,
            'freelancerId': contract.freelancer.toString(),
            'clientId': contract.client.toString(),
            'jobId': contract.job.toString()
        }
    });

    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: user.stripeId },
        { apiVersion: '2020-08-27' }
    );

    res.json({
        message: `Payment intent key for milestone ${milestoneId}`,
        response : {
            customerId: user.stripeId,
            ephemeralKey: ephemeralKey.secret,
            client_secret: paymentIntent.client_secret
        }
    });
}