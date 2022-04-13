const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateWorkSubmit = [
    check('contractId')
        .not()
        .isEmpty()
        .withMessage("contractId cannot be empty"),

    check('milestoneId')
        .not()
        .isEmpty()
        .withMessage("milestoneId cannot be empty"),

    check('description')
        .not()
        .isEmpty()
        .withMessage("description cannot be empty")
        .bail(),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];
