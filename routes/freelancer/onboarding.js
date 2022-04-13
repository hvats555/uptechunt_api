const express = require('express');
const router = express.Router();
const isSignedIn = require('@middleware/isSignedIn');
const {getOnboardingById, updateOnboarding, completeOnboarding} = require('@controllers/freelancer/onboarding');
const validateObjectId = require('@middleware/validation/objectId');
const { isOnboardingOwner } = require('@middleware/ownership');


router.get('/:id', validateObjectId, isSignedIn, isOnboardingOwner, getOnboardingById);
router.put('/:id/complete', validateObjectId, isSignedIn, isOnboardingOwner, completeOnboarding);
router.put('/:id', validateObjectId, isSignedIn, isOnboardingOwner, updateOnboarding);


module.exports = router;