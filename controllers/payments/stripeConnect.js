const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Freelancer = require('@models/Freelancer');
const User = require('@models/User');
const error = require('@utils/error');
const _ = require('lodash');
const Contract = require('@models/Contract');


exports.connectAccountLink = async (req, res) => {
    const freelancer = await Freelancer.findOne({user: req.user._id});

    if(!freelancer.stripeConnectAccount) {
        await stripe.accounts.create({
            type: 'standard',
            country: 'IN',
            email: req.user.email,

            // settings: {
            //     payouts: {
            //         schedule: {
            //         interval: 'manual',
            //         },
            //     },
            // }
          }).then(async (response) => {
            await Freelancer.findOneAndUpdate({user: req.user._id}, {stripeConnectAccount: response.id});
              await stripe.accountLinks.create({
                account: response.id,
                refresh_url: 'https://himalayavats.com',
                return_url: 'https://himalayavats.com',
                type: 'account_onboarding',
            }).then((response) => {
                res.json({
                    message: "Stripe account onboarding link",
                    response: response
                })
            });
          }).catch((err) => {
            return res.status(400).json(error([err.message]));
          });
    }

    await stripe.accountLinks.create({
        account: freelancer.stripeConnectAccount,
        refresh_url: 'https://get-india-work-api.herokuapp.com',
        return_url: 'https://get-india-work-api.herokuapp.com',
        type: 'account_onboarding',
    }).then((response) => {
        res.json({
            message: "Stripe account onboarding link",
            response: response
        })
    });
}

exports.connectLoginLink = async (req, res) => {
    const freelancer = await Freelancer.findOne({user: req.user._id});
    if(!freelancer.stripeConnectAccount) return res.status(400).json(error(["no stripe connect account found"]));

    await stripe.accounts.createLoginLink(freelancer.stripeConnectAccount).then((response) => {
        res.json({
            message: "Login link",
            response: response
        });
    }).catch((err) => {
        return res.status(400).json(error([err.message]));
    });
}

exports.connectAccountDetails = async (req, res) => {
    const freelancer = await Freelancer.findOne({user: req.user._id});
    if(!freelancer.stripeConnectAccount) return res.status(400).json(error(["no stripe connect account found"]));

    const accountDetails = await stripe.accounts.retrieve(freelancer.stripeConnectAccount).catch((err) => {
        return res.status(400).json(error(err.message));
    });

    const accountBalance = await stripe.balance.retrieve({stripeAccount: freelancer.stripeConnectAccount}).catch((err) => {
        return res.status(400).json(error(err.message));
    });

    const payouts = await stripe.payouts.list({limit: 10}, {stripeAccount: freelancer.stripeConnectAccount}).catch((err) => {
        return res.status(400).json(error(err.message));
    });

    accountDetails.accountBalance = accountBalance;
    accountDetails.payoutDetails = payouts;

    const response = {
        message: `Connect account balance for freelancer ${freelancer._id}`,
        response: accountDetails
    }

    res.json(response);

}

exports.connectPaymentIntent = async (req, res) => {
    const user = await User.findById(req.user._id);
    const freelancer = await Freelancer.findOne({stripeConnectAccount: req.body.stripeConnectAccount});

    if(!freelancer) return res.status(400).json(error(["no stripe connect account found, please onboard first"]));
    if(!user.stripeId) return res.status(400).json(error(["no stripe connect account found"]));

    const contract = await Contract.findById(req.body.contractId);

    if(!contract) return res.status(404).json(error(["contract not found"]))

    if(!contract.client.equals(user.roles.client)) return res.status(401).json(error(["you are not the owner of the resource"]));

    const remainingAmount = contract.amount - contract.amountPaid;

    if(req.body.amount > remainingAmount) return res.json(error(["payment amount should be less then or equal remaining amount in the contract"]));

    await stripe.paymentIntents.create({
        payment_method_types: ['card'],
        customer: user.stripeId,
        amount: req.body.amount * 100,
        currency: 'usd',
        metadata: {
            type: 'connect_payment',
            contractId: req.body.contractId
        },
        transfer_data: {
            destination: req.body.stripeConnectAccount,
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

exports.createPayout = async (req, res) => {
    const freelancer = await Freelancer.findOne({user: req.user._id});
    if(!freelancer.stripeConnectAccount) return res.status(400).json(error(["no stripe connect account found"]));

    await stripe.payouts.create({
        amount: req.body.amount,
        currency: 'usd',
      }, {
        stripeAccount: freelancer.stripeConnectAccount,
      }).then((response) => {
          res.json({
            message: "Payout successful",
            response: response
        });
      }).catch((err) => {
        res.status(400).json(error([err.message]));
      });
}