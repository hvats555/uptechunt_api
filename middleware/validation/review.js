const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateNewReview = [
    check('body')
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Review body cannot be empty"),

    check('rating')
        .trim()
        .not()
        .isEmpty()
        .withMessage("Rating cannot be empty")
        .bail()
        .isInt({min:1, max: 5})
        .withMessage("Rating has to be an integer")
        .bail(),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

exports.validateReviewUpdate = [
    check('body')
        .optional()
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Review body cannot be empty"),

    check('rating')
        .optional()
        .trim()
        .not()
        .isEmpty()
        .withMessage("Rating cannot be empty")
        .bail()
        .isInt({min:1, max: 5})
        .withMessage("Rating has to be an integer")
        .bail(),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

