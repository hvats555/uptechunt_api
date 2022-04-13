const express = require('express');

let router = express.Router();

let isSignedIn = require('@middleware/isSignedIn');
const {isFreelancerReviewOwner} = require('@middleware/ownership');

const {validateNewReview, validateReviewUpdate} = require('@middleware/validation/review');
const validateObjectId = require('@middleware/validation/objectId');

const {newReview, getSingleReview, getReview, updateReview, deleteReview} = require('@controllers/freelancer/freelancerReview');

router.get('/', isSignedIn, getReview);
router.get('/:id', validateObjectId, getSingleReview);
router.post('/', isSignedIn, validateNewReview, newReview);

router.put('/:id', isSignedIn, validateObjectId, isFreelancerReviewOwner, validateReviewUpdate, updateReview)
router.delete('/:id', isSignedIn, validateObjectId, isFreelancerReviewOwner, deleteReview);

module.exports = router;