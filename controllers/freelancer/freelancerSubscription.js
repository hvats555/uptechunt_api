const User = require('@models/User');
const Freelancer = require('@models/Freelancer');
var {DateTime} = require('luxon');

const _ = require('lodash');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const error = require('@utils/error');

// freelancer subscription

exports.createSubscription = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]));

    const freelancer = await Freelancer.findById(user.roles.freelancer);

    // ! reactivete it afterwards
    // if(!_.isUndefined(freelancer.subscription) && freelancer.subscription.status === 'active') return res.status(409).json(error(["One subscription is already active, cannot start new subscription until old one is cancelled"]));

    const price = await stripe.prices.retrieve(req.body.priceId);
    const products = await stripe.products.list({});
    let priceProduct = {};

    for(let i=0; i < products.data.length; i++) {
        if(price.product === products.data[i].id) {
            priceProduct = products.data[i];
            break;
        }
    }

    stripe.subscriptions.create({
        customer: user.stripeId,
        default_payment_method: req.body.defaultPaymentMethod,
        metadata: {
            freelancer: freelancer._id.toString()
        },
        
        items: [{
            price: req.body.priceId
        }]
        }).then(async (response) => {
            const freelancer = await Freelancer.findById(user.roles.freelancer);
            const subscriptionBody = {
                priceId: req.body.priceId,
                plan: priceProduct.name,
                remainingProposalCount: Number(priceProduct.metadata.proposals),
                nextFreeProposalCredit: 'N/A',
                defaultPaymentMethod: response.default_payment_method,
                currentPeriodEnd: response.current_period_end,
                subscriptionId: response.id,
                amount: response.items.data[0].plan.amount / 100,
                status: response.status
            }
            
            freelancer.subscription = subscriptionBody;
            freelancer.save();
            
            res.json({
                message: `Subscription created for freelancer: ${freelancer._id}`,
                response: subscriptionBody
            });

        }).catch((err) => {
            return res.status(400).json(error([err.message]));
        });
}
// OK
exports.getSubscription = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]));

    const freelancer = await Freelancer.findById(user.roles.freelancer);

    if(freelancer.subscription.status != 'active') return res.status(400).json(error(["no active subscription found"]));
    
    const subscription = await stripe.subscriptions.retrieve(freelancer.subscription.subscriptionId);

    let response = {};
    response.message = `Subscription details for freelancer ${freelancer._id}`;
    response.response = subscription;
    res.send(response);
}

// OK
exports.updateSubscription = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]));

    const freelancer = await Freelancer.findById(user.roles.freelancer);

    if(!freelancer.subscription) return res.status(400).json(error(["no active subscription found"]));
    const subscription = await stripe.subscriptions.retrieve(freelancer.subscription.subscriptionId);

    // if(freelancer.subscription.priceId === req.body.priceId) return res.status(400).json(error(["this plan is already active"]));

    let updateBody = {};
    let items = [];

    const products = await stripe.products.list({});
    
    let priceProduct = {};

    if(req.body.priceId) {
        const price = await stripe.prices.retrieve(req.body.priceId);

        for(let i=0; i < products.data.length; i++) {
            if(price.product === products.data[i].id) {
                priceProduct = products.data[i];
                break;
            }
        }

        items.push({id: subscription.items.data[0].id, price: req.body.priceId});
        updateBody.items = items;
    }

    if(req.body.defaultPaymentMethod) {
        updateBody.default_payment_method = req.body.defaultPaymentMethod;
    }

    stripe.subscriptions.update(freelancer.subscription.subscriptionId, updateBody).then(async (response) => {
        console.log(response.default_payment_method);

        if(req.body.priceId) {
            freelancer.subscription.plan = priceProduct.name;
            freelancer.subscription.priceId = req.body.priceId;
            freelancer.subscription.remainingProposalCount += Number(priceProduct.metadata.proposals);
        }

        if(req.body.defaultPaymentMethod) {
            freelancer.subscription.defaultPaymentMethod = response.default_payment_method;
        }

        freelancer.subscription.amount = response.items.data[0].plan.amount / 100;
        freelancer.subscription.status = response.status;
        freelancer.save();

        res.json({
            message: `Subscription updated`,
            response: freelancer.subscription
        });
    }).catch((err) => {
        return res.status(400).json(error([err.message]));
    });
}

// OK
exports.cancelSubscription = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]));

    const freelancer = await Freelancer.findById(user.roles.freelancer);

    if(freelancer.subscription.status === 'canceled') return res.status(405).json(error(["subscription already cancelled"]));

    stripe.subscriptions.update(freelancer.subscription.subscriptionId, {cancel_at_period_end: true}).then((response) => {
        freelancer.subscription.cancelAtPeriodEnd = true;
        freelancer.save();
        res.json({
            message: `Subscription will be canceled at period end`,
            response: response
        })
    }).catch((err) => {
        return res.status(400).json(error([err.message]));
    });
}