const Onboarding = require('@models/Onboarding');
const _ = require('lodash');
const mongoose = require('mongoose');

const error = require('@utils/error');
const Freelancer = require('@models/Freelancer');


// display single Onboarding
exports.getOnboardingById = async (req, res) => {
    const onboarding = await Onboarding.findOne({'_id': req.params.id}).select('-createdAt -updatedAt -__v');

    if(!onboarding || _.isEmpty(onboarding)) return res.status(404).json(error(["Onboarding not found"]));

    let response = {};
    response.message = `Onboarding id : ${req.params.id}`;
    response.response = onboarding;

    res.json(response);
}

// updating info in Onboarding 
exports.updateOnboarding = async (req, res) => {
    const onboarding = await Onboarding.findByIdAndUpdate(req.params.id, req.body, {new: true}).select('-createdAt -updatedAt -__v');
    
    let response = {};
    response.message = `Updated Onboarding id : ${req.params.id}`;
    response.response = onboarding;

    res.json(response);
}


// delete Onboarding
exports.completeOnboarding = async (req, res) => {
    // ! enable it in production
    // const onboarding = await Onboarding.findByIdAndDelete(req.params.id).select('-createdAt -updatedAt -__v');
    const freelancer = await Freelancer.findByIdAndUpdate(req.params.id, {isOnboardingCompleted: true}, {new: true}).select('isOnboardingCompleted');

    // if(!onboarding || _.isEmpty(onboarding)) return res.status(404).json(error(["Onboarding not found"]));

    let response = {
        message: `Onboarding completed for freelancer ${req.params.id}`,
        response: {
            isOnboardingCompleted: freelancer.isOnboardingCompleted
        }
    };

    res.json(response);
}