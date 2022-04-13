const mongoose = require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;


// ? Is file upload feature needed in file dispute schema?

const disputeSchema = new Schema({
    attachments: {
        type: Array
    },

    freelancer: {
        type: ObjectId,
        ref: 'Freelancer'
    },

    client: {
        type: ObjectId,
        ref: 'Client'
    },

    disputeBy: {
        type: String,
        enum: ["client", "freelancer"]
    }, 

    contract: {
        type: ObjectId,
        ref: 'Contract'
    },

    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 4500,
    },

    status: {
        type: String,
        default: 'open',
        enum: ['open', 'resolved']
    }
}, {timestamps: true});

module.exports = mongoose.model("Dispute", disputeSchema);