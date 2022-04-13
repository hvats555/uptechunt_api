const mongoose = require('mongoose');
const { Schema } = mongoose;

const skillCategorySchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        minLength: 2,
        maxLength: 100
    },

    description: {
        type: String,
        trim: true,
        minLength: 2,
        maxLength: 1000
    },

    image: { 
        type: String,
        trim: true,
        maxLength: 1000,
        default: " " // TODO placeholder image URL will be here
    },
}, {timestamps: true});

module.exports = mongoose.models.SkillCategory || mongoose.model("SkillCategory", skillCategorySchema);