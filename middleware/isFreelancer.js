const User = require('../models/User');
const _ = require('lodash');

module.exports = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if(_.isUndefined(user.roles.freelancer)) return res.status(400).send("Freelancer account not found");
    next();
}
