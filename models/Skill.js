const mongoose = require('mongoose');
const { Schema } = mongoose;
const {ObjectId} = mongoose.Schema;

const skillSchema = new Schema({
    skillCategory: {
        type: ObjectId,
        ref: 'SkillCategory',
        required: true
    },

    title: {
        type: String,
        trim: true,
        required: true,
        minLength: 1,
        maxLength: 100
    },

    description: {
        type: String,
        trim: true,
        minLength: 10,
        maxLength: 1000
    }
}, {timestamps: true});

module.exports = mongoose.model("Skill", skillSchema);
