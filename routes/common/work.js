const express = require('express');
const router = express.Router();

let isSignedIn = require('@middleware/isSignedIn');
const {submitWork, setWorkStatus, updateWork} = require('@controllers/common/work');

const {validateWorkSubmit} = require('@middleware/validation/work');
const validateObjectId = require('@middleware/validation/objectId');

router.post('/', isSignedIn, validateWorkSubmit, submitWork);
router.patch('/:id/:action', validateObjectId, isSignedIn, setWorkStatus);
router.put('/:id', validateObjectId, isSignedIn, updateWork);

module.exports = router;