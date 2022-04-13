const mongoose = require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;

const submittedWorkSchema = new Schema({
    description: {
        type: String,
        required: true,
        trim: true,
    },

    amount: {
        type: Number,
        required: true,
    },

    attachments: {
        type: Array,
        default: []
    },

    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accepted', 'revision']
    }
}, {timestamps: true});

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
    },

    status: {
        type: String,
        default: 'awaiting',
        enum: ['awaiting', 'active', 'completed']
    },

    fundedAt: {
        type: Date,
        default: null
    },

    paymentIntentId: {
        type: String,
        default: null
    },

    fundReleasedAt: {
        type: Date,
        default: null
    },

    submittedWorkValue: {
        type: Number,
        default: 0
    },

    submittedWork: submittedWorkSchema

}, {timestamps: true});

const contractSchema = new Schema({
    freelancer: {
        type: ObjectId,
        ref: 'Freelancer'
    },

    client: {
        type: ObjectId,
        ref: 'Client'
    },

    proposal: {
        type: ObjectId,
        ref: 'Proposal'
    },

    job: {
        type: ObjectId,
        ref: 'Job'
    },

    dueDate: {
        type: Date,
        required: true
    },

    amount: {
        type: Number,
        required: true,
        trim: true,
    },

    amountPaid: {
        type: Number,
        required: true,
        trim: true,
        default: 0,
    },

    depositType: {
        type: String,
        enum: ["full", "milestone"],
        required: true
    },

    jobType: {
        type: String,
        trim: true,
        enum: ['hourly', 'fixed'],
        required: true
    },

    milestones: [milestoneSchema],
    
    status: {
        type: String,
        trim: true,
        default: 'pending',
        enum: ['pending', 'rejected', 'active', 'completed', 'terminated']
    }
}, {timestamps: true});

module.exports = mongoose.model("Contract", contractSchema);