// checks if account is admin or not
const error = require('../utils/error');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if(!user.isEmailVerified && !user.isPhoneVerified) return res.status(403).json(error(["please verify your email and phone"]));
    if(!user.isPhoneVerified) return res.status(403).json(error(["please verify your phone"]));

    if(!user.isEmailVerified) return res.status(403).json(error(["please verify your email"]));

    next(); 
}