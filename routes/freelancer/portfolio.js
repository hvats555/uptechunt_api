const express = require('express');
const router = express.Router();
const isSignedIn = require('@middleware/isSignedIn');
const {newPortfolio, getPortfolioById, getPortfolio, updatePortfolio, deletePortfolio} = require('@controllers/freelancer/portfolio');
const validateObjectId = require('@middleware/validation/objectId');

router.get('/', getPortfolio);

router.get('/:id', validateObjectId, getPortfolioById);

router.post('/', isSignedIn, newPortfolio);

router.put('/:id', validateObjectId, isSignedIn, updatePortfolio)

router.delete('/:id', isSignedIn, validateObjectId, deletePortfolio);

module.exports = router;