const _ = require('lodash');

module.exports = (user) => {
    console.log(user);
    let file = user;
    let score = 0;
    let total = 10;

    let response = {
        score: 0,
        isEmailVerified: false,
        isPhoneVerified: false,
        profilePicture: false,
        language: false,
        hourlyPrice: false,
        skills: false,
        availability: false,
        headline: false,
        mainSkillCategory: false,
        profileDescription: false
    }


    if (file.isEmailVerified) {
        response.isEmailVerified = true
        score += 1;
    }

    if (file.isPhoneVerified) {
        response.isPhoneVerified = true
        score += 1;
    }

    if (!_.isEmpty(file.profilePicture) && !_.isUndefined(file.profilePicture)) {
        response.profilePicture = true
        score += 1;
    }

    if (!_.isEmpty(file.roles.freelancer.language) && !_.isUndefined(file.roles.freelancer.language)) {
        response.language = true
        score += 1;
    }

    if (!_.isUndefined(file.roles.freelancer.hourlyPrice) && file.roles.freelancer.hourlyPrice > 0) {
        response.hourlyPrice = true
        score += 1;
    }

    if (!_.isEmpty(file.roles.freelancer.skills)) {
        response.skills = true
        score += 1;
    }

    if (!_.isUndefined(file.roles.freelancer.availability) && file.roles.freelancer.availability > 0) {
        response.availability = true
        score += 1;
    }

    if (!_.isEmpty(file.roles.freelancer.headline)) {
        response.headline = true
        score += 1;
    }

    if (!_.isEmpty(file.roles.freelancer.mainSkillCategory)) {
        response.mainSkillCategory = true
        score += 1;
    }

    if (!_.isEmpty(file.roles.freelancer.profileDescription)) {
        response.profileDescription = true
        score += 1;
    }

    response.score = Math.round((score/total) * 100)

    return response;
}