const SkillCategory = require('@models/SkillCategory');
const Skill = require('@models/Skill');
const _ = require('lodash');

const error = require('@utils/error');

// new skill category
exports.newSkillCategory = async (req, res) => {
    let skillCategory = new SkillCategory(_.pick(req.body, ['title', 'description', 'image']));

    skillCategory = await skillCategory.save();
    let response = {};

    response.message = "Skill category successfully created";
    response.response = skillCategory;

    res.json(response);
}

// get all skill category
exports.getSkillCategory = async (req, res) => {
    const skillCategory = await SkillCategory.find({});

    let response = {};
    response.message = "All skill categories";
    response.response = skillCategory;

    res.json(response);
}

// display single skill category
exports.getSkillCategoryById = async (req, res) => {
    const skillCategory = await SkillCategory.findOne({'_id': req.params.id});

    if(!skillCategory || _.isEmpty(skillCategory)) return res.status(404).json(error(["skill category not found"]));

    let response = {};
    response.message = `Skill category id : ${req.params.id}`;
    response.response = skillCategory;

    res.json(response);
}

// updating info in skillCategory 
exports.updateSkillCategory = async (req, res) => {
    const skillCategory = await SkillCategory.findByIdAndUpdate(req.params.id, req.body, {new: true});
    
    let response = {};
    response.message = `Updated skill category id : ${req.params.id}`;
    response.response = skillCategory;

    res.json(response);
}


// delete skillCategory
exports.deleteSkillCategory = async (req, res) => {
    const skillCategory = await SkillCategory.findByIdAndDelete(req.params.id);

    if(!skillCategory || _.isEmpty(skillCategory)) return res.status(404).json(error(["skill category not found"]));

    let response = {};
    response.message = `Deleted skill category id : ${req.params.id}`;
    response.response = skillCategory;

    res.json(response);
}

exports.getSkillsByCategory = async (req, res) => {
    const skill = await Skill.find({'skillCategory': req.params.id});

    const response = {
        message: `Skills of category : ${req.params.id}`,
        response: {
            result: skill
        }

    };

    res.json(response);
}