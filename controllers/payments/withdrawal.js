const Wallet = require("@models/Wallet");
const Withdrawal = require("@models/Withdrawal");
const _ = require("lodash");
const error = require("@utils/error");

const filterAndPaginateV2 = require("@middleware/filterAndPaginateV2");

const populateQuery = [
  {
    path: "freelancer",
    select: "hourlyPrice rating totalEarnings user",
    populate: {
      path: "user",
      select: "profilePicture firstName lastName country",
    },
  },
];

exports.newWithdrawal = async (req, res) => {
  const amount = req.body.amount;

  if (amount < 0)
    return res.status(406).send(error(["amount has to be greater then 0"]));

  const checkWallet = await Wallet.find({ freelancer: req.user.freelancer });
  if (!checkWallet)
    return res.status(404).send(error(["cannot find wallet with given id"]));

  if (checkWallet.amount < amount)
    return res.status(406).send(error(["insufficient balance"]));

  const wallet = await Wallet.updateOne(
    { freelancer: req.user.freelancer },
    {
      $inc: { amount: Math.abs(amount) * -1 },
      $push: {
        transaction: {
          amount: amount,
          type: "debit",
        },
      },
    }
  );

  if (!wallet)
    return res.status(500).json(error(["freelancer wallet update failed"]));

  let withdrawal = new Withdrawal({
    freelancer: req.user.freelancer,
    amount: amount,
  });

  await withdrawal.save();

  withdrawal = await Withdrawal.populate(withdrawal, {
    path: "freelancer",
    select: "_id",
  });

  res.send({
    message: "Withdrawel request submitted",
    response: withdrawal,
  });
};

exports.allWithdrawals = async (req, res) => {
  // status, freelancer

  let query = {};

  if (req.query.status) {
    if (_.includes(["pending", "processing", "completed"], req.query.status)) {
      query.status = req.query.status;
    } else {
      return res
        .status(400)
        .json(
          error([
            "withdrawal status can be either pending, processing or completed",
          ])
        );
    }
  }

  if (req.query.freelancerId) {
    if (!mongoose.Types.ObjectId.isValid(req.query.freelancerId))
      return res.status(400).json(error(["invalid freelancer id"]));

    query.freelancer = req.query.freelancerId;
  }

  const populateQuery = [
    {
      path: "freelancer",
      select: "_id user",
      populate: {
        path: "user",
        select: "_id firstName lastName country email profilePicture",
      },
    },
  ];

  const results = await filterAndPaginateV2(
    req.query.page,
    req.query.limit,
    Withdrawal,
    query,
    null,
    populateQuery
  );

  const response = {
    message: "Withdrawals",
    meta: results.meta,
    response: {
      results: results.results,
    },
  };

  res.json(response);
};

exports.getWithdrawalById = async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id).populate(
    populateQuery
  );
  if (!withdrawal)
    return res
      .status(404)
      .send(error(["cannot find withdrawel request given id"]));

  res.json({
    message: `Withdrawal info for ${req.params.id}`,
    response: withdrawal,
  });
};

exports.updateWithdrawal = async (req, res) => {
  // send email to user -> pending, completed

  const updateBody = {
    status: req.body.status,
  };

  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    updateBody,
    { new: true }
  );
  if (!withdrawal)
    return res.status(404).json(error(["payment withdrawal not found"]));

  res.json({
    message: "withdrawal updated",
    response: withdrawal,
  });
};
