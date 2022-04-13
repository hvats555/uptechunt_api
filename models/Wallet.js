const mongoose = require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;

const transactionSchema = new Schema({
    amount: {
        type: Number,
        min: 0,
        default: 0,
        required: true
    },

    type: {
        type: String,
        enum: ["credit", "debit"],
        required: true
    },

    contract: {
        type: ObjectId,
        ref: 'Contract',
        default: null
    },

    milestone: {
        type: ObjectId,
        default: null
    }
}, {timestamps: true});

const walletSchema = new Schema({
    freelancer: {
        type: ObjectId,
        ref: 'Freelancer'
    },

    amount: {
        type: Number,
        min: 0,
        default: 0
    },

    transaction: [transactionSchema]

}, {timestamps: true});

module.exports = mongoose.model("Wallet", walletSchema);
