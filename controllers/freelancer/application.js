const Freelancer = require("@models/Freelancer");
const Application = require("@models/Application");
const Skill = require("@models/Skill");
const User = require("@models/User");
const error = require("@utils/error");
const filterAndPaginate = require("@middleware/filterAndPaginate");
const profileScore = require("@utils/profileScore");
const mongoose = require("mongoose");
const { includes } = require("lodash");

exports.newApplication = async (req, res) => {
  const freelancer = await Freelancer.findById(req.user.freelancer);
  if (!freelancer) return res.status(404).json(error(["freelancer not found"]));

  let application = await Application.findOne({
    freelancer: req.user.freelancer,
  });

  if (application && application.status == "pending")
    return res.status(404).json(error(["application in review"]));

  if (application && application.status == "approved")
    return res.status(404).json(error(["application already approved"]));

  application = new Application({
    freelancer: req.user.freelancer,
  });

  application.save();

  res.json({
    message: "Application sent for review",
    response: {},
  });
};

exports.allApplications = async (req, res) => {
  const query = {};

  if (req.query.status) {
    if (!includes(["approved", "rejected", "pending"], req.query.status))
      return res
        .status(400)
        .json(error(["status can be either approved, rejected or pending"]));

    query.status = req.query.status;
  }

  if (req.query.freelancer) {
    if (!mongoose.Types.ObjectId.isValid(req.query.freelancer))
      return res.status(400).json(error(["invalid object id"]));

    const freelancer = await Freelancer.findById(req.query.freelancer);
    if (!freelancer)
      return res.status(404).json(error(["freelancer not found"]));

    query.freelancer = req.query.freelancer;
  }

  const results = await filterAndPaginate(
    req.query.page,
    req.query.limit,
    Application,
    query,
    null,
    null,
    null
  );

  // doing it manually, but have to find the better way of doing it

  for (let i = 0; i < results.results.length; i++) {
    const f = await Freelancer.findById(results.results[i].freelancer)
      .populate("user", "-password -signInHistory -passwordResetToken -roles")
      .populate("skills skillCategories", "_id title")
      .exec();

    results.results[i].freelancer = f;
  }

  const response = {
    message: "Applications",
    meta: results.meta,
    response: {
      results: results.results,
    },
  };

  res.json(response);
};

exports.getApplicationById = async (req, res) => {
  const application = await Application.findById(req.params.id).populate({
    path: "freelancer",
    populate: [
      { path: "user", select: "-password -roles" },
      { path: "skills", select: "_id title description" },
      { path: "skillCategories", select: "_id title description" },
    ],
  });

  if (!application)
    return res.status(404).json(error(["cannot find application"]));

  const user = await User.findOne({
    "roles.freelancer": application.freelancer,
  });

  let response = {};
  response.message = `application id : ${req.params.id}`;
  response.response = application;
  response.profileCompleteness = profileScore(user.toObject());

  res.json(response);
};

exports.updateApplication = async (req, res) => {
  if (!req.params.id)
    return res.status(400).json(error(["provide application id"]));
  if (!req.body.status)
    return res.status(400).json(error(["provide application status"]));

  if (!includes(["pending", "approved", "rejected"], req.body.status))
    return res
      .status(400)
      .json(error(["status can be either approved, rejected or pending"]));

  let status;
  let isProfileApproved;
  let rejectionReason = null;

  if (req.body.rejectionReason && req.body.status == "rejected")
    rejectionReason = req.body.rejectionReason;

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, rejectionReason: rejectionReason },
    { new: true }
  );

  await Freelancer.findByIdAndUpdate(application.freelancer, {
    isProfileApproved: isProfileApproved,
  });

  if (!application)
    return res.status(404).json(error(["unable to change application status"]));

  res.json({
    message: `Application is ${status}`,
    response: application,
  });
};
