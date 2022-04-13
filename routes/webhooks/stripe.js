const express = require('express');
const router = express.Router();

const { stripe } = require('../../controllers/webhooks/stripe');

router.post('/', express.raw({type: 'application/json'}), stripe);

module.exports = router;