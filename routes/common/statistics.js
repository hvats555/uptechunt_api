const express = require('express');
const router = express.Router();
const isSignedIn = require('@middleware/isSignedIn');
const isAdmin = require('@middleware/isAdmin');
const validateObjectId = require('@middleware/validation/objectId');

const { freelancerStatistics, clientStatistics } = require('@controllers/common/statistics');

router.get('/freelancer/:id', isSignedIn, validateObjectId, freelancerStatistics);
router.get('/client/:id', isSignedIn, validateObjectId, clientStatistics);

module.exports = router;