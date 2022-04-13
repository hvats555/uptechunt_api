const express = require('express');
const router = express.Router();

const {sendPasswordResetLink, resetPassword} = require('@controllers/auth/passwordReset');

router.post('/:token', resetPassword);
router.post('/', sendPasswordResetLink);

module.exports = router;