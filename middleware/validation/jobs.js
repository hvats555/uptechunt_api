const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateNewJob = [
    check("title")
        .not()
        .isEmpty()
        .withMessage("Title cannot be empty")
        .bail()
        .isLength({min:10})
        .withMessage("Title must be of minimum 10 characters"),

    check('description')
        .not()
        .isEmpty()
        .withMessage("Description cannot be empty")
        .bail()
        .isLength({min:10, max: 4500})
        .withMessage("Description length must be between 10 and 4500 characters"),

    check('duration')
        .not()
        .isEmpty()
        .withMessage("Duration cannot be empty")
        .bail()
        .isInt()
        .withMessage("duration must be and integer"),

    check('expertiseLevel')
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("expertiseLevel cannot be empty")
        .bail()
        .isIn(['entrylevel', 'intermediate', 'expert'])
        .withMessage("Expertise level can be either entrylevel, intermediate or expert"),

    check('jobType')
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("jobType cannot be empty")
        .bail()
        .isIn(['fixed', 'hourly'])
        .withMessage("Job type can be either hourly or fixed"),

    check('skills')
        .not()
        .isEmpty()
        .withMessage("Skill cannot be empty")
        .bail()
        .isArray()
        .withMessage("Skills has to be in array format"),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

exports.validateJobUpdate = [
    check("title")
        .optional()
        .not()
        .isEmpty()
        .withMessage("Title cannot be empty")
        .bail()
        .isLength({min:10})
        .withMessage("Title must be of minimum 10 characters"),

    check('description')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Description cannot be empty")
        .bail()
        .isLength({min:10, max: 4500})
        .withMessage("Description length must be between 10 and 4500 characters"),

    check('status')
        .optional()
        .trim()
        .not()
        .isEmpty()
        .withMessage("Status cannot be empty")
        .isIn(['open', 'closed'])
        .withMessage("job status can be either open or closed")
        .bail(),

    check("status")
        .not()
        .exists()
        .withMessage("status cannot be updated from this route, try /api/jobs/:jobId/complete"),

    check('duration')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Duration cannot be empty")
        .bail()
        .isInt()
        .withMessage("duration must be and integer"),

    check('expertiseLevel')
        .optional()
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("expertiseLevel cannot be empty")
        .bail()
        .isIn(['entrylevel', 'intermediate', 'expert'])
        .withMessage("Expertise level can be either entrylevel, intermediate or expert"),

    check('jobType')
        .optional()
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("jobType cannot be empty")
        .bail()
        .isIn(['fixed', 'hourly'])
        .withMessage("Job type can be either hourly or fixed"),

    check('skills')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Skill cannot be empty")
        .bail()
        .isArray()
        .withMessage("Skills has to be in array format"),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

