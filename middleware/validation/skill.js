const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateNewSkill = [
    check('title')
        .not()
        .isEmpty()
        .withMessage("title cannot be empty")
        .bail()
        .isLength({min:1, max: 100})
        .withMessage("Title length must be between 10 and 4500 characters"),

    check('description')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Description cannot be empty")
        .bail()
        .isLength({min:10, max: 1000})
        .withMessage("Description length must be between 10 and 4500 characters"),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

exports.validateSkillUpdate = [
    check('title')
        .optional()
        .not()
        .isEmpty()
        .withMessage("title cannot be empty")
        .bail()
        .isLength({min:10, max: 100})
        .withMessage("Description length must be between 10 and 4500 characters"),

    check('description')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Description cannot be empty")
        .bail()
        .isLength({min:10, max: 1000})
        .withMessage("Description length must be between 10 and 4500 characters"),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];


