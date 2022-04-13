const mongoose = require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;

//TODO client and freelancer review are almost same, refactor them afterwards

const clientReviewSchema = new Schema({
    client: {
        type: ObjectId,
        ref: 'Client'
    },

    body: {
        type: String,
        required: true,
        trim: true
    },

    author: {
        id: {
            type: ObjectId,
            ref: 'User'
        },

        name: {
            type: String
        },

        country: {
            type: String
        }
    },
    
    rating: {
        type: Number,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('ClientReview', clientReviewSchema);