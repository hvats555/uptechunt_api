const express = require('express');
let router = express.Router();

const isSignedIn = require('@middleware/isSignedIn');
const {isFreelancerOwner} = require('@middleware/ownership');
const {validateFreelancerUpdate} = require('@middleware/validation/freelancer');
const validateObjectId = require('@middleware/validation/objectId');

const {getFreelancers, getCurrentUserFreelancer, updateFreelancer, getFreelancerById, getReviewsByFreelancerId, getProposalsByFreelancerId, getCurrentUserWallet} = require('@controllers/freelancer/freelancer');

const {createSubscription, updateSubscription, getSubscription, cancelSubscription} = require('@controllers/freelancer/freelancerSubscription');

router.get('/wallet', isSignedIn, getCurrentUserWallet);

router.get('/subscription', isSignedIn, getSubscription);
router.post('/subscription', isSignedIn, createSubscription);
router.put('/subscription', isSignedIn, updateSubscription);
router.put('/subscription/cancel', isSignedIn, cancelSubscription);

router.get('/me', isSignedIn, getCurrentUserFreelancer);

router.get('/', isSignedIn, getFreelancers);

router.get('/:id', isSignedIn, validateObjectId, getFreelancerById);
router.put('/', isSignedIn, validateFreelancerUpdate, updateFreelancer);        

// extended routes
router.get('/:id/reviews', validateObjectId, isSignedIn, getReviewsByFreelancerId);
router.get('/:id/proposals', validateObjectId, isSignedIn, getProposalsByFreelancerId);

module.exports = router;