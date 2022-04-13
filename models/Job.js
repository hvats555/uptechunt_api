const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = mongoose.Schema;

const jobSchema = new Schema({
    client: {
        type: ObjectId,
        ref: 'Client'
    },

    title: {
        type: String,
        trim: true,
        required: true,
        minLength: 10,
        index: true,
        maxLength: 1000
    },

    description: {
        type: String,
        trim: true,
        required: true,
        index: true,
        minLength: 10,
        maxLength: 4500
    },

    skills: [{type: ObjectId, ref:"Skill", required: true}],

    skillCategories: [{
        type: ObjectId,
        ref:"SkillCategory",
        required: true
    }],

    status: {
        type: String,
        trim: true,
        default: 'open',
        enum: ['open', 'ongoing', 'completed']
    },

    contracts: [{
        type: ObjectId,
        ref: 'Contract'
    }],  

    amount: {
        type: Number,
        required: true,
        trim: true,
        default: 0,
    },

    duration: { // * project duration in months
        type: Number,
        required: true,
        trim: true,
        default: 0,
    },

    expertiseLevel: {
        type: String,
        trim: true,
        enum: ['entrylevel', 'intermediate', 'expert']
    },

    jobType: {
        type: String,
        trim: true,
        enum: ['hourly', 'fixed']
    },

    proposals: [
        {
            type: ObjectId,
            ref: 'Proposal'
        }
    ],

    attachments : {
        type: Array,
        default: []
    },

    // preferredLocation : {
    //     type: Array
    // },

    // preferredLanguage : {
    //     type: String
    // },

    // preferredEarnings : {
    //     type: Number
    // },

    // preferredRating : {
    //     type: Number
    // }

}, {timestamps: true});

module.exports = mongoose.model("Job", jobSchema);