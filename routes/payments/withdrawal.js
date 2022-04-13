const express = require('express');
const router = express.Router();

let isSignedIn = require('@middleware/isSignedIn');
const { newWithdrawal, allWithdrawals, getWithdrawalById, updateWithdrawal } = require('@controllers/payments/withdrawal');

// const {validateWorkSubmit} = require('../middleware/validation/work');
const validateObjectId = require('@middleware/validation/objectId');

// TODO: Add validate withdrawal submit.

router.post('/', isSignedIn , newWithdrawal);
router.get('/', isSignedIn, allWithdrawals);
router.get('/:id', isSignedIn, getWithdrawalById);
router.put('/:id', validateObjectId, isSignedIn, updateWithdrawal);

module.exports = router;