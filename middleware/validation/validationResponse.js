const {validationResult} = require('express-validator');
const { NetworkContext } = require('twilio/lib/rest/supersim/v1/network');
const error = require('../../utils/error');

module.exports = (req, res, next) => {
    const errors = validationResult(req);
    let errorMessageArray = [];
    
    errors.array().forEach((err) => {
        errorMessageArray.push(err.msg);
    });

    if (!errors.isEmpty()) {
        return res.status(400).json(error(errorMessageArray));
    } else {
        next();
    }
}
