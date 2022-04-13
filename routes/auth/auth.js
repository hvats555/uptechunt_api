const express = require('express');

let router = express.Router();

const {signup, signin, signout, adminSignin} = require('@controllers/auth/auth');
const {validateSignup, validateSignIn, validateGoogleSignUp} = require('@middleware/validation/auth');

const { googleAuth } = require('@controllers/auth/social/google');

router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignIn, signin);

router.post('/admin/signin', validateSignIn, adminSignin);

router.post('/signout', signout);

// social

router.post('/social/google', validateGoogleSignUp, googleAuth)

module.exports = router;