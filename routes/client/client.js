const express = require('express');
const router = express.Router();

const isSignedIn = require('@middleware/isSignedIn');
const {isClientOwner} = require('@middleware/ownership');
const {validateClientUpdate} = require('@middleware/validation/client');

const {getAllClients, getClientById, getJobsByClientId, getReviewsByClientId, getCurrentUserWallet, getCurrentClient, rechargeWallet, updateClient} = require('@controllers/client/client');
const validateObjectId = require('@middleware/validation/objectId');

router.get('/wallet', isSignedIn, getCurrentUserWallet);
router.post('/wallet/recharge', isSignedIn, rechargeWallet);

router.get('/me', isSignedIn, getCurrentClient);
router.get('/', isSignedIn, getAllClients);
router.get('/:id', validateObjectId, getClientById);
router.put('/', isSignedIn, validateClientUpdate, updateClient);        

// extended routes
router.get('/:id/jobs', validateObjectId, isSignedIn, getJobsByClientId);
router.get('/:id/reviews', validateObjectId, isSignedIn, getReviewsByClientId);

module.exports = router;