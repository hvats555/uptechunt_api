var cron = require('node-cron');
var {DateTime} = require('luxon');
const Freelancer = require('@models/Freelancer');

// * ? create function for autodown grade

exports.proposalCredit = () => {
    // for starter plan do this,
    // for paid plan use web hook
    // 0 0 0 * * * -> every day, 12 AM
    
    cron.schedule('0 0 0 * * *', async () => {
        const now =  DateTime.now().toFormat('dd-MM-yyyy');
        const nextMonthDate = DateTime.now().plus({ months: 1 }).toFormat('dd-MM-yyyy');

        const freelancer = await Freelancer.find({'subscription.nextFreeProposalCredit': now, 'subscription.plan': 'starter'}).exec();

        for(let i=0; i<freelancer.length; i++) {
            freelancer[i].subscription.remainingProposalCount = 25;
            freelancer[i].subscription.nextFreeProposalCredit = nextMonthDate;
            freelancer[i].save();

            console.log(freelancer[i]);  
        }
    });    
}
