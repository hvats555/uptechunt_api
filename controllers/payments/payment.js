const Client = require('@models/Client');
const Freelancer = require('@models/Freelancer');
const Job = require('@models/Job');
const User = require('@models/User');
const _ = require('lodash');

const error = require('@utils/error');

exports.payment = async (req, res) => {
    let paymentSummary = {
        message: '',
        result: {}
    };

    const user = await User.findById(req.user._id);

    if(!user) return res.status(404).send("user not available");

    const job = await Job.findOne({'contract.submittedWork._id': req.body.workId});
    if(!job) return res.status(404).json(error(["cannot find job"]));

    const client = await Client.findById(job.client);

    const freelancer = await Freelancer.findById(job.contract.freelancer);

    if(!(user.roles.client.equals(job.client))) return res.status(401).json(error(["current client id does not match with client id in contract, you are not authorized to perform this action"]));

    job.contract.submittedWork.find(work => {
        if(work._id.equals(req.body.workId)) {
            if(work.status === 'paid') return res.status(405).json(error(["already paid for this work, cannot pay again"]));
            if(work.status === 'rejected') return res.status(405).json(error(["work is rejected cannot pay"]));
            if(work.status === 'pending') return res.status(405).json(error(["work status is pending cannot pay"]));

            if(work.status === 'approved') {
                if(client.wallet.balance < work.amount) return res.status(400).json(error("insufficient balance"));

                client.wallet.balance -= work.amount; // deducting amount from client account
                freelancer.wallet.balance += work.amount; // adding amount to freelancer account
                freelancer.totalEarnings += work.amount; // updating freelancer total earnings
                client.totalSpent += work.amount; // updating client total spend
                job.contract.amountPaid += work.amount; // updating paid amount for the contract
                work.status = 'paid'; // setting work status to paid

                paymentSummary.result.amount = work.amount; // adding paid amount to summary
                paymentSummary.result.updatedWalletBalance = client.wallet.balance; // adding new wallet balance 
                paymentSummary.result.workId = work._id;
            }
        }
    });

    client.save();
    freelancer.save();
    job.save();

    paymentSummary.message = "Payment successful";
    paymentSummary.result.jobId = job._id;
    paymentSummary.result.reciever = freelancer._id; // adding freelancer id to summary
    paymentSummary.result.sender = client._id; // adding client id to summary

    client.wallet.transactions.push(paymentSummary);

    res.json(paymentSummary);
}


