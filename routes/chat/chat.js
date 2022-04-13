const express = require('express');

let router = express.Router();

const { setChannelMembers } = require('@controllers/chat/chat');


router.post('/members', setChannelMembers);

module.exports = router;