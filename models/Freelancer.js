const mongoose = require('mongoose');
const { Schema } = mongoose;
const {  ObjectId } = mongoose.Schema;

const workExperienceSchema = new Schema({
    heading : {
        type: String,
    },

    company : {
        type: String,
    },

    description : {
        type: String
    },

    startYear : {
        type: Date,
    },

    endYear : {
        type: Date,
    }
});

const educationSchema = new Schema({
    heading : {
        type: String,
    },

    school : {
        type: String,
    },

    description : {
        type: String
    },

    startYear : {
        type: Date,
    },

    endYear : {
        type: Date,
    }
});

const languageSchema = new Schema({
    name : {
        type: String,
        required: true
    },

    level : {
        type: String,
        // enum : ["conversational", "fluent", "native", "Fluent"],
        required: true
    }
});

const subscriptionSchema = new Schema({
    subscriptionId: {
        type: String
    },

    defaultPaymentMethod: {
        type: String
    },

    priceId: {
        type: String
    },

    plan: {
        type: String,
        default: "starter"
    },

    amount: {
        type: Number,
        default: 0,
        required: true
    },

    status: {
        type: String
    },

    currentPeriodEnd: {
        type: Number
    },

    nextFreeProposalCredit: {
        type: String
    },

    cancelAtPeriodEnd: {
        type: Boolean
    },

    remainingProposalCount: {
        type: Number,
        default: 25
    }
});

const payoutSchema = new Schema({
    amount: {
        type: Number,
        min: 1,
        required: true
    }
}, {timestamps: true});

const freelancerWalletSchema = new Schema({
    balance: {
        type: Number,
        min: 0,
        default: 0,
    },

    payouts: [payoutSchema]
});

    // skills
    //total projects
    // total hours

const freelancerSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },

    headline: {
        type: String,
        maxLength: 500
    },

    profileDescription: {
        type: String,
        trim: true,
        minLength: 10,
        maxLength: 4500
    },

    subscription: subscriptionSchema,

    availability: {
        type: String    
    },

    language: [languageSchema],

    hourlyPrice: {
        type: Number,
        default: 10
    },

    isProfileApproved: {
        type: Boolean,
        trim: true,
        default: false
    },

    portfolio: [ // ! embed
        {
            type: ObjectId,
            ref: 'Portfolio'
        }
    ],

    skills: [
        {
            type: ObjectId,
            ref: 'Skill'
        }
    ],

    skillCategories: [
        {
            type: ObjectId,
            ref: 'SkillCategory'
        }
    ],

    mainSkillCategory: {
        type: ObjectId,
        ref: 'SkillCategory'
    },

    // * freelancer rating would be average of all review ratings.
    rating: {
        type: Number,
        default: 5,
    },

    wallet: freelancerWalletSchema,

    stripeConnectAccount: {
        type: String
    },

    totalEarnings: {
        type: Number,
        default: 0
    },

    totalHours: {
        type: Number,
        default: 0
    },

    isOnboardingCompleted : {
        type: Boolean,
        default: false
    },

    disputes: [ // ! embed
        {
            type: ObjectId,
            ref: 'Dispute'
        }
    ],

    contracts: [
        {
            type: ObjectId,
            ref: 'Contract'
        }
    ],

    workExperiences : [workExperienceSchema],

    education : [educationSchema]
}, {timestamps: true});

module.exports = mongoose.models.Freelancer || mongoose.model("Freelancer", freelancerSchema);