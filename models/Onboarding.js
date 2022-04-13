const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema;

const onboardingSchema = new Schema({
    screen: {
        type: Number,
        required: true,
        default: 1
    },
}, {timestamps: true});

module.exports = mongoose.model("Onboarding", onboardingSchema);
