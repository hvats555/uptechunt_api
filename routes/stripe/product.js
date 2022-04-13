// Create 
// Read
// Update
// Delete

const express = require('express');
const router = express.Router();

const {newProduct, getAllProducts} = require('@controllers/stripe/product');

const isSignedIn = require('@middleware/isSignedIn');

router.post('/', isSignedIn, newProduct);
router.get('/', isSignedIn, getAllProducts);

module.exports = router;

