const express = require('express');

const router = express.Router();

const isSignedIn = require('@middleware/isSignedIn');
const {isProposalOwner} = require('@middleware/ownership');
const validateObjectId = require('@middleware/validation/objectId');

const {validateNewProposal, validateJobUpdate} = require('@middleware/validation/proposal');
const {newProposal, getProposalById, getProposal, updateProposal, deleteProposal, proposalRecharge} = require('@controllers/common/proposal');

const isUserVerified = require('@middleware/isUserVerified');

// todo :- Write a middleware - haveFreelancerAccount and haveClientAccount to check the account status

// ! check if you can combine multiple middlewares to reduce server calls
// ! Proposal can only be viewed by either sender or reciever, not anyone else.

router.get('/', getProposal);

// proposal recharge

router.get('/recharge', isSignedIn, proposalRecharge);

router.get('/:id', validateObjectId, isSignedIn, getProposalById);
router.post('/', isSignedIn, isUserVerified, validateNewProposal, newProposal);
router.put('/:id', validateObjectId, isSignedIn, isProposalOwner, validateJobUpdate, updateProposal);
router.delete('/:id', validateObjectId, isSignedIn, isProposalOwner, deleteProposal);

module.exports = router;