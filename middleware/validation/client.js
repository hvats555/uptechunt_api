const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateClientUpdate = [
    check('companyWebsite')
        .optional()
        .not()
        .isEmpty()
        .withMessage("companyWebsite cannot be empty"),

    check('profileDescription')
        .optional()
        .not()
        .isEmpty()
        .withMessage("profileDescription cannot be empty"),

    check('companyName')
        .optional()
        .not()
        .isEmpty()
        .withMessage("companyName cannot be empty"),
    
    (req, res, next) => {
        validationErrorResponse(req, res, next);
    }
];