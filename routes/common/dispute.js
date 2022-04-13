const express = require('express');

let router = express.Router();
const validateObjectId = require('@middleware/validation/objectId');

const { newDispute, allDisputes, disputeAction, getDisputeById } = require('@controllers/common/dispute');

let isSignedIn = require('@middleware/isSignedIn');
let isAdmin = require('@middleware/isAdmin');

router.post('/', isSignedIn, newDispute);
router.get('/', isSignedIn, isAdmin, allDisputes);
router.get('/:id', validateObjectId, isSignedIn, isAdmin, getDisputeById);
router.patch('/', isSignedIn, isAdmin, disputeAction);

module.exports = router;