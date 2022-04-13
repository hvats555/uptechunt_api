const express = require('express');
const router = express.Router();

let isSignedIn = require('@middleware/isSignedIn');
const {isContractOwner, isContractJobOwner, isAuthorizedToViewContract} = require('@middleware/ownership');

const {newContract, getContractById, updateContract, deleteContract, setContractStatus, getContracts, submitWork} = require('@controllers/common/contract');

const { newMilestone, milestoneFundingPaymentIntent } = require('@controllers/common/milestone');

const {validateNewContract, validateContractUpdate, validateNewMilestone} = require('@middleware/validation/contract');
const validateObjectId = require('@middleware/validation/objectId');

router.patch('/:id', validateObjectId, isSignedIn, setContractStatus);

router.post('/', isSignedIn, isContractJobOwner, validateNewContract, newContract); 
router.get('/', isSignedIn, getContracts);
router.get('/:id', validateObjectId, isSignedIn, isAuthorizedToViewContract, getContractById);
router.put('/:id', validateObjectId, isSignedIn, isContractOwner, validateContractUpdate, updateContract);
router.delete('/:id', validateObjectId, isSignedIn, isContractOwner, deleteContract);

// milestone

// fund milestone
// todo also verify contract ownership
router.post('/milestone/:milestoneId/fund', isSignedIn, milestoneFundingPaymentIntent);

// new milestone
router.post('/:contractId/milestone', isSignedIn, validateNewMilestone, newMilestone);

module.exports = router;