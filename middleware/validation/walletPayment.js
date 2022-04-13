const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateWalletPayment = [
    check('workId')
        .not()
        .isEmpty()
        .withMessage("workId cannot be empty"),

        (req, res, next) => {
            validationErrorResponse(req, res, next);       
        }
];
