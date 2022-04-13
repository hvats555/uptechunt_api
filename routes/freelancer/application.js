const express = require("express");

let router = express.Router();
const validateObjectId = require("@middleware/validation/objectId");

const {
  newApplication,
  allApplications,
  updateApplication,
  getApplicationById,
} = require("@controllers/freelancer/application");

let isSignedIn = require("@middleware/isSignedIn");
let isAdmin = require("@middleware/isAdmin");

router.post("/", isSignedIn, newApplication);
router.get("/:id", validateObjectId, getApplicationById);
router.get("/", isSignedIn, isAdmin, allApplications);
router.put("/:id", isSignedIn, isAdmin, updateApplication);

module.exports = router;
