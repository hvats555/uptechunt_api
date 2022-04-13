const mongoose = require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;

const applicationSchema = new Schema({
    freelancer: {
        type: ObjectId,
        ref: 'Freelancer'
    },

    status: {
        type: String,
        enum: ['approved', 'rejected', 'pending'],
        default: 'pending'
    },

    rejectionReason: {
        type: String,
        default: null
    }
}, {timestamps: true});

module.exports = mongoose.model("Application", applicationSchema);
