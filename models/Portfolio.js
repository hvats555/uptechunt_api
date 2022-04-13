const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const portfolioSchema = new Schema({
    freelancer: {
        type: ObjectId,
        ref: 'Freelancer',
        required: true
    },

    coverImage: {
        type: String,
        required: true
    },

    title: {
        type: String,
        trim: true,
        required: true,
        minLength: 1,
        maxLength: 100
    },

    description: {
        type: String,
        trim: true,
        minLength: 10,
        maxLength: 1000,
        required: true
    },

    link: {
        type: String
    }
}, {timestamps: true});

module.exports = mongoose.model("Portfolio", portfolioSchema);
