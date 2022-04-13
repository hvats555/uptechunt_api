const express = require('express');
const router = express.Router();
const isSignedIn = require('@middleware/isSignedIn');
const isAdmin = require('@middleware/isAdmin');
const {validateNewSkill, validateSkillUpdate} = require('@middleware/validation/skill');
const {newSkill, getSingleSkill, getSkill, updateSkill, deleteSkill} = require('@controllers/common/skill');
const validateObjectId = require('@middleware/validation/objectId');

router.get('/', getSkill);
router.get('/:id', validateObjectId, getSingleSkill);

router.post('/', isSignedIn, isAdmin, validateNewSkill, newSkill);

router.put('/:id', validateObjectId, isSignedIn, isAdmin, validateSkillUpdate, updateSkill)
router.delete('/:id', validateObjectId, isSignedIn, isAdmin, validateObjectId, deleteSkill);

module.exports = router;