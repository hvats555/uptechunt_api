const mongoose = require("mongoose");
const Skill = require("@models/Skill");
const SkillCategory = require("@models/SkillCategory");
const _ = require("lodash");

const error = require("@utils/error");

// new skill
exports.newSkill = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.skillCategory))
    return res.status(400).json(error(["invalid skill category id"]));

  const skillCategory = await SkillCategory.findById(req.body.skillCategory);
  if (!skillCategory)
    return res.status(404).json(error(["cannot find skill category"]));

  const skillBody = {
    title: req.body.title,
    description: req.body.description,
    skillCategory: skillCategory._id,
  };

  let skill = new Skill(skillBody);
  skill = await skill.save();

  let response = {};
  response.message = "Skill successfully created";
  response.response = skill;

  res.json(response);
};

// get all skill
exports.getSkill = async (req, res) => {
  const skill = await Skill.find({}).populate(
    "skillCategory",
    "description title _id image"
  );

  let response = {
    message: "All skills",
    response: {
      result: skill,
    },
  };

  res.json(response);
};

// display single skill
exports.getSingleSkill = async (req, res) => {
  const skill = await Skill.findOne({ _id: req.params.id }).populate(
    "skillCategory",
    "description title _id image"
  );
  if (!skill || _.isEmpty(skill))
    return res.status(404).json(error(["skill not found"]));

  let response = {};
  response.message = `Skill id : ${req.params.id}`;
  response.response = skill;

  res.json(response);
};

// updating info in skill
exports.updateSkill = async (req, res) => {
  console.log(req.body);
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  let response = {};
  response.message = `Updated skill id : ${req.params.id}`;
  response.response = skill;

  res.json(response);
};

// delete skill
exports.deleteSkill = async (req, res) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);
  if (!skill) return res.status(404).json(error(["skill not found"]));

  let response = {};
  response.message = `Deleted skill id : ${req.params.id}`;
  response.response = skill;

  res.json(response);
};
