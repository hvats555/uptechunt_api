const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateUserUpdate = [
    check("isAdmin")
        .not()
        .exists()
        .withMessage("Users can not set themselves admin"),

    check('phone')
        .optional()
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Phone number cannot be empty")
        .bail()
        .isLength({min: 10, max: 10})
        .withMessage("Invalid phone number, have to be 10 digits exactly"),

    check("password")
        .not()
        .exists()
        .withMessage("password cannot be updated from this route"),

    check("email")
        .not()
        .exists()
        .withMessage("email cannot be updated from this route"),

    check("profilePicture")
        .not()
        .exists()
        .withMessage("profile picture cannot be updated from this route"),

    check("firstName")
        .optional()
        .not()
        .isEmpty()
        .withMessage("First Name cannot be empty")
        .bail()
        .isLength({min:3})
        .withMessage("Name must be of minimum 2 characters"),

    check('lastName')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Last Name cannot be empty")
        .bail()
        .isLength({min:1})
        .withMessage("Last name must be of minimum 1 characters"),
    
    check('fcmRegistrationToken')
        .optional()
        .not()
        .isEmpty()
        .withMessage("fcmRegistrationToken cannot be empty")
        .bail(),

    check('country')
        .optional()
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Country cannot be empty")
        .bail()
        .isLength({min:2})
        .withMessage("Country must be of minimum 2 characters"),

    check('address')
        .optional()
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Address cannot be empty")
        .bail(),

    check('city')
        .optional()
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("City cannot be empty")
        .bail(),

    check('pinCode')
        .optional()
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Pincode cannot be empty")
        .bail(),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

exports.validateEmailUpdate = [
    check("email")
        .exists()
        .withMessage("Email field not provided")
        .isEmail()
        .withMessage("Invalid email format"),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
];

exports.validatePhoneUpdate = [
    check('countryCode')
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Country code cannot be empty")
        .bail()
        .isLength({min:1})
        .withMessage("Country must be of minimum 1 characters"),

    check('phone')
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Phone number cannot be empty")
        .bail()
        .isLength({min: 10, max: 10})
        .withMessage("Invalid phone number, have to be 10 digits exactly"),

        (req, res, next) => {
            validationErrorResponse(req, res, next);
        }
]
