const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateFreelancerUpdate = [
    check("isProfileApproved")
        .not()
        .exists()
        .withMessage("Only admins can set this property"),

    check("user")
        .not()
        .exists()
        .withMessage("Cannot update user directly"),

    check("reviews")
        .not()
        .exists()
        .withMessage("Cannot update reviews directly"),

    check("wallet")
        .not()
        .exists()
        .withMessage("Cannot update wallet directly"),

    check("totalEarnings")
        .not()
        .exists()
        .withMessage("Cannot update total earnings directly"),

    check("disputes")
        .not()
        .exists()
        .withMessage("Cannot update disputes directly"),
    
    check("contracts")
        .not()
        .exists()
        .withMessage("Cannot update contracts directly"),

    check('profileDescription')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Cannot send empty profile description")
        .bail()
        .isLength({min: 10})
        .withMessage("Minimum length of profile description must be 10 characters"),

    check('skills')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Cannot send empty skills")
        .bail()
        .isArray()
        .withMessage("Skills must be an array"),

    check('mainSkill')
        .optional()
        .not()
        .isEmpty()
        .withMessage("main skill cannot be empty"),
    
    check("language")
        .optional()
        .not()
        .isEmpty()
        .withMessage("Cannot send empty language")
        .bail()
        .isArray()
        .withMessage("Language must be an array"),

    check('headline')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Cannot send empty skills")
        .bail()
        .isLength({min: 10})
        .withMessage("Minimum length of headline must be 10 characters"),

    check('availability')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Cannot send empty availability")
        .bail()
        .isNumeric()
        .withMessage("Minimum length of headline must be 10 characters"),
    
    (req, res, next) => {
        validationErrorResponse(req, res, next);
    }
];