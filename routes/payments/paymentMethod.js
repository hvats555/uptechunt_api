const express = require('express');
const router = express.Router();

const isSignedIn = require('@middleware/isSignedIn');

const {getSetupIntentKey, allPaymentMethods, updatePaymentMethod, deletePaymentMethod, getSinglePaymentMethod} = require('@controllers/payments/paymentMethod');

router.get('/setupIntent', isSignedIn, getSetupIntentKey);
router.get('/', isSignedIn, allPaymentMethods);
router.put('/:paymentMethodId', isSignedIn, updatePaymentMethod);
router.get('/:paymentMethodId', isSignedIn, getSinglePaymentMethod);
router.get('/:paymentMethodId/detach',isSignedIn, deletePaymentMethod);

module.exports = router;