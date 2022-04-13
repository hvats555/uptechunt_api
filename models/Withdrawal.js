const mongoose = require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;

const withdrawalSchema = new Schema({
    freelancer: {
        type: ObjectId,
        ref: 'Freelancer',
        required: true
    },

    amount: {
        type: Number,
        min: 0,
        default: 0,
        required: true
    },

    status: {
        type: String,
        default: "pending",
        enum: ["pending", "processing", "completed"]
    },

    processedAt: {
        type: Date
    },

    completedAt: {
        type: Date
    }

}, {timestamps: true});

module.exports = mongoose.model("Withdrawel", withdrawalSchema);
