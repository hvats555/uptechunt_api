const mongoose = require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;

const freelancerReviewSchema = new Schema({
    freelancer: {
        type: ObjectId,
        ref: 'Freelancer'
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
        },

        profilePicture: {
            type: String
        },

        companyName: {
            type: String
        },
    },
    
    rating: {
        type: Number,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('FreelancerReview', freelancerReviewSchema);