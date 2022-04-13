const Freelancer = require('../models/Freelancer');
const { DateTime } = require("luxon");

const error = require('../utils/error');

module.exports =  async () => {
    const freelancer = await Freelancer.findOne({user: req.user._id});
    if(freelancer.subscription.status === 'inactive') return res.status(405).json(error(["subscription is inactive"]));

    // enter local time here
    const currentPeriodEnd = freelancer.subscripton.currentPeriodEnd;
    const time = new Date(currentPeriodEnd * 1000).toJSON();
    
    const currentTime = DateTime.now().toUTC();
    
    const subscriptionTimeLeft = DateTime.fromISO(time).diff(currentTime).milliseconds;
    
    // set subscription period to inactive if currentPeriod is end and bill not paid

    if(subscriptionTimeLeft < 0) {
        freelancer.subscription.satus = "inactive";
        freelancer.save();
        return res.status(405).json(error(["subscription is inactive"]));
    }

    next(); 
}
