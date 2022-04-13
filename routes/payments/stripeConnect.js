const express = require('express');
const router = express.Router();
const isSignedIn = require('@middleware/isSignedIn');
const {connectAccountLink, connectLoginLink, connectAccountDetails, connectPaymentIntent} = require('@controllers/payments/stripeConnect');

// extended routes
router.get('/', isSignedIn, connectAccountDetails);
router.get('/link', isSignedIn, connectAccountLink);
router.get('/login-link', isSignedIn, connectLoginLink);
router.post('/payment-intent', isSignedIn, connectPaymentIntent);

// router.post('/payouts', isSignedIn, createPayout);


module.exports = router;