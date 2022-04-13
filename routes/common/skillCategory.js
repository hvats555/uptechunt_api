const express = require("express");
const router = express.Router();
const validateObjectId = require("@middleware/validation/objectId");
const isAdmin = require("@middleware/isAdmin");
const isSignedIn = require("@middleware/isSignedIn");

const {
  newSkillCategory,
  getSkillCategoryById,
  getSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
  getSkillsByCategory,
} = require("@controllers/common/skillCategory");

const {
  validateNewSkillCategory,
} = require("@middleware/validation/skillCategory");

// get all SkillCategory
router.get("/", getSkillCategory);

// get single SkillCategory
router.get("/:id", validateObjectId, getSkillCategoryById);

// create new skill category
router.post(
  "/",
  isSignedIn,
  isAdmin,
  validateNewSkillCategory,
  newSkillCategory
);

// update skill category
router.put("/:id", validateObjectId, isSignedIn, isAdmin, updateSkillCategory);

// delete SkillCategory
router.delete(
  "/:id",
  validateObjectId,
  isSignedIn,
  isAdmin,
  deleteSkillCategory
);

// extended routes
router.get("/:id/skills", validateObjectId, getSkillsByCategory);

module.exports = router;
