const {check} = require('express-validator');
const validationErrorResponse = require('./validationResponse');

exports.validateSignup = [
    check("isAdmin")
        .not()
        .exists()
        .withMessage("Users can not set themselves admin"),

    check("isEmailVerified")
        .not()
        .exists()
        .withMessage("isEmailVerified cannot be set from this route"),

    check("isPhoneVerified")
        .not()
        .exists()
        .withMessage("isPhoneVerified can not be set from this route"),

    check("firstName")
        .not()
        .isEmpty()
        .withMessage("First Name cannot be empty")
        .bail()
        .isLength({min:3})
        .withMessage("Name must be of minimum 2 characters"),

    check('lastName')
        .not()
        .isEmpty()
        .withMessage("Last Name cannot be empty")
        .bail()
        .isLength({min:1})
        .withMessage("Last name must be of minimum 1 characters"),

    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage("Email cannot be empty")
        .isEmail()
        .withMessage("Invalid email"),

    check('password')
        .not()
        .isEmpty()
        .withMessage("Password cannot be empty")
        .bail()
        .isLength({min: 5})
        .withMessage("password must be of atleast 5 characters"),

    check('country')
        .trim()
        .escape()
        .not()
        .isEmpty()
        .withMessage("Country cannot be empty")
        .bail()
        .isLength({min:2})
        .withMessage("Country must be of minimum 2 characters"),

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
];

exports.validateSignIn = [
    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage("Email cannot be empty")
        .bail()
        .isEmail()
        .withMessage("Invalid email")
        .bail(),

    check('password')
        .not()
        .isEmpty()
        .withMessage("Password cannot be empty")
        .bail()
        .isLength({min: 5})
        .withMessage("password must be of atleast 5 characters"),
    
    (req, res, next) => {
        validationErrorResponse(req, res, next);
    }
];

exports.validateGoogleSignUp = [
    check('tokenId')
        .trim()
        .not()
        .isEmpty()
        .withMessage("Token id cannot be empty")
        .bail(),

    (req, res, next) => {
        validationErrorResponse(req, res, next);
    }
];