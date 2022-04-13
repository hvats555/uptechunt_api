// checks if account is admin or not
const error = require('../utils/error');

module.exports = function(req, res, next){
    if(!req.user.isAdmin) return res.status(403).json(error(["Forbidden"]));
    next(); 
}