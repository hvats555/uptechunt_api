const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Freelancer = require('@models/Freelancer');
const Contract = require('@models/Contract');

// * credit proposal here, while webhook payment is successfull

const handleSubscriptionInvoicePaid = async (req, res) => {
    let event = req.body;

    const invoice = event.data.object;
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    console.log(subscription.plan.metadata.proposals);
    const freelancer = await Freelancer.findById(subscription.metadata.freelancer);

    freelancer.subscription.status = subscription.status;
    freelancer.subscription.remainingProposalCount += parseInt(subscription.plan.metadata.proposals);

    freelancer.subscription.currentPeriodEnd = subscription.current_period_end,

    freelancer.save();
}

const handleSubscriptionUpdate = async (req, res) => {
    let event = req.body;
    let subscription = event.data.object;

    const freelancer = await Freelancer.findById(subscription.metadata.freelancer);

    freelancer.subscription.status = subscription.status;
    freelancer.subscription.currentPeriodEnd = subscription.current_period_end,
    freelancer.subscription.cancelAtPeriodEnd = subscription.cancel_at_period_end

    freelancer.save();
    console.log(freelancer);
}

const handleSubscriptionDeleted = async (req, res) => {
    let event = req.body;

    let subscription = event.data.object;
    let freelancer = await Freelancer.findById(subscription.metadata.freelancer);

    freelancer.subscription.status = subscription.status;
    freelancer.subscription.plan = 'starter';
    freelancer.save();
    console.log(`Subscription canceled for freelancer ${freelancer._id}`);
}

const handlePaymentIntentSucceeded = async (req, res) => {
    console.log("triggered payment method succeedded");
    let event = req.body;

    let paymentIntent = event.data.object;
    const freelancer = await Freelancer.findById(paymentIntent.metadata.freelancer);

    if(paymentIntent.metadata.type == 'proposal_recharge') {
        console.log("Proposal recharge just happened");
        freelancer.subscription.remainingProposalCount += parseInt(paymentIntent.metadata.proposals);
        freelancer.save();
    } else if (paymentIntent.metadata.type == 'milestone_funding') {   
        console.log("Webhook hitted after payment");
        console.log(paymentIntent);     
        const contract = await Contract.updateOne(
            { _id: paymentIntent.metadata.contractId, "milestones._id": paymentIntent.metadata.milestoneId },
            {
                $set: {
                    "milestones.$.status": "active",
                    "milestones.$.fundedAt": new Date().toISOString(),
                    "milestones.$.paymentIntentId": paymentIntent.id
                },

                $inc: { "amountPaid": paymentIntent.amount/100 }
            }
        )

        if(!contract) return res.status(404).json(error(["no contract found with given milestone id"]));
    }
}

exports.stripe = async (req, res) => {
    let event = req.body;

    switch (event.type) {
        case "payment_intent.succeeded":
            handlePaymentIntentSucceeded(req, res);
            break;

        case "customer.subscription.deleted":
            handleSubscriptionDeleted(req, res);
            break;

        case "invoice.paid":
            handleSubscriptionInvoicePaid(req, res);
            break;
        
        case "customer.subscription.updated":
            handleSubscriptionUpdate(req, res);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

  res.json({received: true});
}