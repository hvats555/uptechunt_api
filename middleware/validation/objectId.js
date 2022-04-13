const mongoose = require('mongoose');
const error = require('../../utils/error');

// TODO hey, make sure to refractor it and make it universal ;)
module.exports = (req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json(error(["invalid object id"]));
    next();
}