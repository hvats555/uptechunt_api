const mongoose = require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;

const bannedUser = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },

    reason: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 4500
    }
}, {timestamps: true});

module.exports = mongoose.model("bannedUser", bannedUser);
