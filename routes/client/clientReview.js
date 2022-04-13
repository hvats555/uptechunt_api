const express = require('express');
const router = express.Router();

const isSignedIn = require('@middleware/isSignedIn');
const {isClientReviewOwner} = require('@middleware/ownership');
const {validateNewReview, validateReviewUpdate} = require('@middleware/validation/review');
const validateObjectId = require('@middleware/validation/objectId');

const {newReview, getReviewById, getReview, updateReview, deleteReview} = require('@controllers/client/clientReview');

router.get('/', getReview);
router.get('/:id', validateObjectId, getReviewById);
router.post('/', isSignedIn, validateNewReview, newReview);

router.put('/:id', validateObjectId, isSignedIn, isClientReviewOwner, validateReviewUpdate, updateReview);
router.delete('/:id', validateObjectId, isSignedIn, isClientReviewOwner, deleteReview);

module.exports = router;