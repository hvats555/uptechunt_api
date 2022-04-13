const express = require('express');

let router = express.Router();
const validateObjectId = require('@middleware/validation/objectId');

const {banUser, allBannedUsers, getBannedUserById, deleteBan } = require('@controllers/user/bannedUser');

let isSignedIn = require('@middleware/isSignedIn');
let isAdmin = require('@middleware/isAdmin');

router.post('/', isSignedIn, isSignedIn, isAdmin, banUser);
router.get('/:id', validateObjectId, isSignedIn, isAdmin, getBannedUserById );
router.get('/', isSignedIn, isAdmin, allBannedUsers);
router.delete('/:id', validateObjectId, isSignedIn, isAdmin, deleteBan);

module.exports = router;