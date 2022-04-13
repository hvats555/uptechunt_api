const Portfolio = require('@models/Portfolio');
const _ = require('lodash');
const mongoose = require('mongoose');

const error = require('@utils/error');

const filterAndPaginateV2 = require('@middleware/filterAndPaginateV2');

// new skill category
exports.newPortfolio = async (req, res) => {
    const requestBody = {
        freelancer: req.user.freelancer,
        coverImage: req.body.coverImage,
        title: req.body.title,
        description: req.body.description,
        link: req.body.link ? req.body.link : null
    }

    let portfolio = new Portfolio(requestBody);

    portfolio = await portfolio.save();
    let response = {};

    response.message = "Portfolio successfully created";
    response.response = portfolio;

    res.json(response);
}

// get all skill category // ! filter required
exports.getPortfolio = async (req, res) => {
    let query = {};

    if(req.query.freelancerId) {
        if(!mongoose.Types.ObjectId.isValid(req.query.freelancerId)) return res.status(400).json(error(["invalid freelancer id"]));

        query.freelancer = req.query.freelancerId;
    }

    const portfolio = await filterAndPaginateV2(req.query.page, req.query.limit, Portfolio, query, '-freelancer', null);

    let response = {};
    response.message = "portfolio";
    response.response = portfolio;

    res.json(response);
}

// display single portfolio
exports.getPortfolioById = async (req, res) => {
    const portfolio = await Portfolio.findOne({'_id': req.params.id}).select('-freelancer');

    if(!portfolio || _.isEmpty(portfolio)) return res.status(404).json(error(["portfolio not found"]));

    let response = {};
    response.message = `portfolio id : ${req.params.id}`;
    response.response = portfolio;

    res.json(response);
}

// updating info in Portfolio 
exports.updatePortfolio = async (req, res) => {
    const portfolio = await Portfolio.findByIdAndUpdate(req.params.id, req.body, {new: true}).select('-freelancer');
    
    let response = {};
    response.message = `Updated portfolio id : ${req.params.id}`;
    response.response = portfolio;

    res.json(response);
}


// delete Portfolio
exports.deletePortfolio = async (req, res) => {
    const portfolio = await Portfolio.findByIdAndDelete(req.params.id).select('-freelancer');

    if(!portfolio || _.isEmpty(portfolio)) return res.status(404).json(error(["portfolio not found"]));

    let response = {};
    response.message = `Deleted portfolio id : ${req.params.id}`;
    response.response = portfolio;

    res.json(response);
}