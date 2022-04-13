const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateNewContract = [
    check("milestones")
        .not()
        .isEmpty()
        .withMessage("Milestone is required")
        .bail()
        .isArray()
        .withMessage("Milestones has to be array")
        .bail(),

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

    check("amount")
        .not()
        .isEmpty()
        .withMessage("Amount cannot be empty")
        .bail()
        .isInt()
        .withMessage("Amount has to be integer")
        .bail(),

    // check("depositType")
    //     .not()
    //     .isEmpty()
    //     .withMessage("depositType cannot be empty")
    //     .isIn(['full', 'milestone'])
    //     .withMessage("deposite type can be either full or milestone")
    //     .bail(),

    // check("jobType")
    //     .not()
    //     .isEmpty()
    //     .withMessage("jobType cannot be empty")
    //     .isIn(['hourly', 'fixed'])
    //     .withMessage("job type can be either hourly or fixed")
    //     .bail(),

    check('dueDate')
        .not()
        .isEmpty()
        .withMessage("Due date cannot be empty")
        .bail(),

    check('jobId')
        .not()
        .isEmpty()
        .withMessage("Job Id cannot be empty"),

    check('proposalId')
        .not()
        .isEmpty()
        .withMessage("Proposal Id cannot be empty"),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

exports.validateContractUpdate = [
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

    check('status')
        .isEmpty()
        .withMessage("Contract status can not be set from this route")
        .bail(),

    check("amount")
        .optional()
        .not()
        .isEmpty()
        .withMessage("Amount cannot be empty")
        .bail(),

    check('dueDate')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Due date cannot be empty")
        .bail(),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

exports.validateContractUpdate = [
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

    check('status')
        .isEmpty()
        .withMessage("Contract status can not be set from this route")
        .bail(),

    check("amount")
        .optional()
        .not()
        .isEmpty()
        .withMessage("Amount cannot be empty")
        .bail(),

    check('dueDate')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Due date cannot be empty")
        .bail(),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];


exports.validateNewMilestone = [
    check("amount")
        .not()
        .isEmpty()
        .withMessage("Milestone amount cannot be empty")
        .bail()
        .isInt()
        .withMessage("Milestone amount has to be integer")
        .bail(),

    check("description")
        .not()
        .isEmpty()
        .withMessage("description cannot be empty")
        .bail(),

    check("dueDate")
        .not()
        .isEmpty()
        .withMessage("due date cannot be empty")
        .bail(),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

exports.validateMilestoneUpdate = [
    check("amount")
        .optional()
        .not()
        .isEmpty()
        .withMessage("Milestone amount cannot be empty")
        .bail()
        .isInt()
        .withMessage("Milestone amount has to be integer")
        .bail(),

    check("description")
        .optional()
        .not()
        .isEmpty()
        .withMessage("description cannot be empty")
        .bail(),

    check("dueDate")
        .optional()
        .not()
        .isEmpty()
        .withMessage("due date cannot be empty")
        .bail(),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];




