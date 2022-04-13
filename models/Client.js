const mongoose = require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;

const subscriptionSchema = new Schema({
    subscriptionId: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true
    }
});

const rechargeHistorySchema = new Schema({
    amount: {
        type: String,
        required: true
    },

    paymentMethod: {
        type: String,
        required: true
    },

    // try adding payment method details later

    receiptUrl: {
        type: String,
        required: true
    },

    transactionId: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    }
}, {timestamps: true});

const transactionschema = new Schema({
    sender: {
        type: ObjectId,
        ref: 'Client',
        required: true
    },

    reciever: {
        type: ObjectId,
        ref: 'Freelancer',
        required: true
    },

    jobId: {
        type: ObjectId
    },

    workId: {
        type: ObjectId
    },

    amount: {
        type: Number,
        min: 1,
        required: true
    },

    updatedBalance: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true,
        enum: ["success", "failled"]
    }
}, {timestamps: true});

const clientWalletSchema = new Schema({
    balance: {
        type: Number,
        min: 0,
        default: 0,
    },

    transactions: [transactionschema],
    rechargeHistory: [rechargeHistorySchema],
});

const clientSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },

    companyName: {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 100
    },

    profileDescription: {
        type: String,
        trim: true,
        minLength: 10,
        maxLength: 4500
    },

    companyWebsite: {
        type: String,
        trim: true
    },

    // * client rating would be average of all review ratings.
    rating: {
        type: Number,
        default: 5,
    },

    totalSpent: {
        type: Number,
        default: 0
    },

    wallet: clientWalletSchema,
    subscription: subscriptionSchema,


    // ! embed
    disputes: [
        {
            type: ObjectId,
            ref: 'Dispute'
        }
    ],
    
}, {timestamps: true});

module.exports = mongoose.models.Client || mongoose.model('Client', clientSchema);