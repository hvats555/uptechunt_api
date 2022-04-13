const User = require('@models/User');
const _ = require('lodash');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const error = require('@utils/error');

// this is to add a new card -> backend will send a setup intent key and frontend can utilize it 
// to add a new card

exports.getSetupIntentKey = async (req, res) => {
    const user = await User.findById(req.user._id);

    const intent = await stripe.setupIntents.create({
        customer: user.stripeId,
    }).catch(err => {
        res.status(400).json(error([`stripe error: ${err.message}`]));
    });
    
    res.json({
        message: `setup intent client secret for user ${user._id}`,
        response: {
            intentKey: intent.client_secret
        }
    })
}

exports.allPaymentMethods = async (req, res) => {
    const user = await User.findById(req.user._id);

    const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeId,
        type: 'card',
    }).catch(err => {
        res.status(400).json(error([`stripe error: ${err.message}`]));
    });

    res.json({
        message: `Payment methods for user ${user._id}`,
        response: paymentMethods
    }) 
}

exports.updatePaymentMethod = async (req, res) => {
    const paymentMethod = await stripe.paymentMethods.update(req.params.paymentMethodId, req.body).catch(err => {
        res.status(400).json(error([`stripe error: ${err.message}`]));
    });

    const response = {
        message: "payment method updated",
        response: paymentMethod,
    }

    res.send(response);
}

exports.deletePaymentMethod = async (req, res) => {
    const paymentMethod = await stripe.paymentMethods.detach(req.params.paymentMethodId).catch(err => {
        res.status(400).json(error([`stripe error: ${err.message}`]));
    });

    const response = {
        message: `Detached payment method`,
        response: paymentMethod
    }

    res.json(response)
}

exports.getSinglePaymentMethod = async (req, res) => {
    const paymentMethod = await stripe.paymentMethods.retrieve(req.params.paymentMethodId).catch(err => {
        res.status(400).json(error([`stripe error: ${err.message}`]));
    })

    const response = {
        message: `Payment method details`,
        response: paymentMethod
    }

    res.json(response)
}