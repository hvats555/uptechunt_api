const User = require("@models/User");
const BannedUser = require("@models/BannnedUser");
const error = require("@utils/error");
const filterAndPaginateV2 = require("@middleware/filterAndPaginateV2");

exports.banUser = async (req, res) => {
  const { userId, reason } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json(error(["user not found"]));

  if (user.isAdmin)
    return res
      .status(405)
      .json(error(["admin cannot be banned from platform"]));

  const checkBannedUser = await BannedUser.findOne({ user: userId });
  if (checkBannedUser)
    return res.status(409).json(error(["user already banned"]));

  const bannedUser = new BannedUser({
    _id: userId,
    user: userId,
    reason: reason,
  });

  bannedUser.save();

  user.isBanned = true;
  user.save();

  let response = {
    message: `Banned user ${userId}`,
    response: null,
  };

  res.json(response);
};

exports.allBannedUsers = async (req, res) => {
  const query = {};

  const populateQuery = [
    {
      path: "user",
      select: "profilePicture firstName lastName country",
    },
  ];

  const results = await filterAndPaginateV2(
    req.query.page,
    req.query.limit,
    BannedUser,
    query,
    null,
    populateQuery
  );

  const response = {
    message: "Banned users",
    meta: results.meta,
    response: {
      results: results.results,
    },
  };

  res.json(response);
};

exports.getBannedUserById = async (req, res) => {
  const populateQuery = [
    {
      path: "user",
      select: "profilePicture firstName lastName country",
    },
  ];

  const bannedUser = await BannedUser.findById(req.params.id).populate(
    populateQuery
  );

  if (!bannedUser)
    return res.status(404).json(error(["cannot find banned user"]));

  res.json({
    message: `Banned user details`,
    result: bannedUser,
  });
};

exports.deleteBan = async (req, res) => {
  const bannedUser = await BannedUser.findOneAndDelete({ user: req.params.id });

  if (!bannedUser)
    return res.status(404).json(error(["cannot find banned user"]));

  await User.findByIdAndUpdate(req.params.id, {
    isBanned: false,
  });

  res.json({
    message: `Ban released from user ${req.params.id}`,
    result: null,
  });
};
