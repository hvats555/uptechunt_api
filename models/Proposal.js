const mongoose =  require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;

const milestoneSchema = new Schema({
    description: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true,
    },

    dueDate: {
        type: String,
        required: true
    }
});

const proposalSchema = new Schema({
    job: {
        type: ObjectId,
        ref: 'Job'
    },

    bidAmount: {
        type: Number,
        required: true
    },

    freelancer: {
        type: ObjectId,
        ref: 'Freelancer'
    },

    coverLetter: {
        type: String,
        trim: true,
        required: true,
        minLength: 10,
        maxLength: 4500
    },

    attachments : {
        type: Array,
        default: []
    },

    status: {
        type: String,
        trim: true,
        default: 'open',
        enum: ['open', 'rejected', 'interviewing', 'hired', 'archived']
    },

    milestones: [milestoneSchema],

    duration: { // * project duration in months
        type: String,
        required: true,
        trim: true
    }    
}, {timestamps: true});

module.exports = mongoose.model("Proposal", proposalSchema);