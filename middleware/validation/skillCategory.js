const { check } = require("express-validator");
const validationErrorResponse = require("./validationResponse");

exports.validateNewSkillCategory = [
  check("title")
    .not()
    .isEmpty()
    .withMessage("title cannot be empty")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage("Title length must be between 2 and 4500 characters"),

  check("description")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Description cannot be empty")
    .bail()
    .isLength({ min: 2, max: 1000 })
    .withMessage("Description length must be between 2 and 4500 characters"),

  (req, res, next) => {
    validationErrorResponse(req, res, next);
  },
];

exports.validateSkillCategoryUpdate = [
  check("title")
    .optional()
    .not()
    .isEmpty()
    .withMessage("title cannot be empty")
    .bail()
    .isLength({ min: 2, max: 100 })
    .withMessage("Description length must be between 10 and 4500 characters"),

  check("description")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Description cannot be empty")
    .bail()
    .isLength({ min: 2, max: 1000 })
    .withMessage("Description length must be between 10 and 4500 characters"),

  (req, res, next) => {
    validationErrorResponse(req, res, next);
  },
];
