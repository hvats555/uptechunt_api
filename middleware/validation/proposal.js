const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateNewProposal = [
    check("milestones.*.amount")
        .not()
        .isEmpty()
        .withMessage("Milestone amount cannot be empty")
        .bail()
        .isInt()
        .withMessage("Milestone amount has to be integer")
        .bail(),

    check("milestones.*.description")
        .not()
        .isEmpty()
        .withMessage("description cannot be empty")
        .bail(),

    check("milestones.*.dueDate")
        .not()
        .isEmpty()
        .withMessage("due date cannot be empty")
        .bail(),

    check('coverLetter')
        .not()
        .isEmpty()
        .withMessage("coverLetter cannot be empty")
        .bail()
        .isLength({min:10, max: 4500})
        .withMessage("coverLetter length must be between 10 and 4500 characters"),

    check('duration')
        .not()
        .isEmpty()
        .withMessage("Duration cannot be empty"),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

exports.validateJobUpdate = [
    check("milestones.*.amount")
        .optional()
        .not()
        .isEmpty()
        .withMessage("Milestone amount cannot be empty")
        .bail()
        .isInt()
        .withMessage("Milestone amount has to be integer")
        .bail(),

    check("milestones.*.description")
        .optional()
        .not()
        .isEmpty()
        .withMessage("description cannot be empty")
        .bail(),

    check("milestones.*.dueDate")
        .optional()
        .not()
        .isEmpty()
        .withMessage("due date cannot be empty")
        .bail(),

    check('coverLetter')
        .optional()
        .not()
        .isEmpty()
        .withMessage("coverLetter cannot be empty")
        .bail()
        .isLength({min:10, max: 4500})
        .withMessage("coverLetter length must be between 10 and 4500 characters"),

    check('duration')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Duration cannot be empty"),

    (req, res, next) => {
        validationErrorResponse(req, res, next);
    }
];

