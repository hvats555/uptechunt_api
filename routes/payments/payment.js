const express = require('express');
const router = express.Router();

const isSignedIn = require('@middleware/isSignedIn');
const {payment} = require('@controllers/payments/payment');
const {validateWalletPayment} = require('@middleware/validation/walletPayment');

router.post('/', isSignedIn, validateWalletPayment, payment);

module.exports = router;