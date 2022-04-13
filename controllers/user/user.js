const User = require('@models/User');
const Client = require('@models/Client');
const Freelancer = require('@models/Freelancer');
const _ = require('lodash');
const profileScore = require('@utils/profileScore');

const {deleteFile} = require('@middleware/upload');

const error = require('@utils/error');

const filterAndPaginateV2 = require('@middleware/filterAndPaginateV2');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

exports.userInfo = async (req, res) => {
  const populateQuery = [{ 
    path: 'roles',
    populate: {
    path: 'client',
    model: 'Client'
    }},
    { 
     path: 'roles',
     populate: [{
       path: 'freelancer',
       model: 'Freelancer'
     }],
    },
    {
     path: 'roles.freelancer',
     populate: [{
         path: 'skills',
         model: 'Skill',
         select: 'title _id'
     }, {
         path: 'mainSkillCategory',
         model: 'SkillCategory',
         select: 'title _id image'
     }]
  }]

    let user = await User.findById(req.user._id).select('-password').populate(populateQuery).exec();

    if(!user) return res.status(404).json(error(["user not found"]));

    let response = {};
    response.message = `User info : ${req.user._id}`;
    response.response = _.omit(user.toObject(), ['roles.client.user', 'roles.freelancer.user']);

    response.profileCompleteness = profileScore(user.toObject());

    res.json(response);
}

// Get user info by id
exports.userInfoById = async (req, res) => {
    const populateQuery = [{ 
        path: 'roles',
        populate: {
        path: 'client',
        model: 'Client'
        }},
        { 
         path: 'roles',
         populate: [{
           path: 'freelancer',
           model: 'Freelancer'
         }],
        },
        {
         path: 'roles.freelancer',
         populate: [{
            path: 'skills',
            model: 'Skill',
            select: 'title _id'
        }, {
            path: 'mainSkillCategory',
            model: 'SkillCategory',
            select: 'title _id image'
        }]
      }]

    let user = await User.findById(req.params.id).select('-password').populate(populateQuery).exec();

    if(!user) return res.status(404).send("User not found");

    let response = {};
    user.profileCompleteness = profileScore(user.toObject());
    response.message = `User info : ${req.params.id}`;
    response.response = user;

    res.json(response);
}

exports.allUsers = async (req, res) => {
    let query = {};

    // country, email

    const populateQuery = [{ 
        path: 'roles',
        populate: {
        path: 'client',
        model: 'Client'
        }},
        { 
         path: 'roles',
         populate: [{
           path: 'freelancer',
           model: 'Freelancer'
         }],
        },
        {
         path: 'roles.freelancer',
         populate: [{
            path: 'skills',
            model: 'Skill',
            select: 'title _id'
        }, {
            path: 'mainSkillCategory',
            model: 'SkillCategory',
            select: 'title _id image'
        }]
      }]

    if(req.query.email && req.query.country) return res.status(405).json(error(["email and country cannot be used together"]));

    if(req.query.country) query.country = req.query.country.toLowerCase();
    if(req.query.email) query.email = req.query.email;

    const results = await filterAndPaginateV2(req.query.page, req.query.limit, User, query, null, populateQuery);

    const response = {
        message: "Users",
        meta: results.meta,
        response: {
            results: results.results
        }
    }

    res.json(response);
}

// update user
exports.updateUser = async (req, res) => {
    const populateQuery = [{ 
        path: 'roles',
        populate: {
        path: 'client',
        model: 'Client'
        }},
        { 
         path: 'roles',
         populate: [{
           path: 'freelancer',
           model: 'Freelancer'
         }],
        },
        {
         path: 'roles.freelancer',
         populate: [{
            path: 'skills',
            model: 'Skill',
            select: 'title _id'
        }, {
            path: 'mainSkillCategory',
            model: 'SkillCategory',
            select: 'title _id image'
        }, {
            path: 'user',
            model: 'User',
            select: '_id'
        }]
      }, {
        path: 'roles.client',
        populate: [{
           path: 'user',
           model: 'User',
           select: '_id'
       }]
     }]

    let user = await User.findByIdAndUpdate(req.user._id, req.body, {new: true}).populate(populateQuery).exec();
    
    if(!user) return res.status(404).json(error(["user not found"]));

    let response = {};
    response.message = `Updated user: ${req.params.id}`;
    response.response = _.omit(user, ['password']);

    res.json(user);
}

exports.updateEmail = async (req, res) => {
    console.log(req.user);
    let user = await User.findByIdAndUpdate(req.user._id, {
        email: req.body.email,
        isEmailVerified: false
    }, {new: true})

    if(!user) return res.status(404).json(error(["user not found"]));

    client.verify.services(process.env.TWILIO_VERIFY_SERVICE_ID)
    .verifications
    .create({to: user.email, channel: 'email'})
    .then(verification => res.json({
        message: `Email successfully updated, verification email is sent to ${verification.to}`
    }))
    .catch((err)=>{
        res.json(error([err]));
    });
}

exports.updatePhone = async (req, res) => {
    let user = await User.findByIdAndUpdate(req.user._id, {
        phone: req.body.phone,
        countryCode: req.body.countryCode,
        isPhoneVerified: false
    }, {new: true})

    if(!user) return res.status(404).json(error(["user not found"]));

    let phoneNumber = `+${user.countryCode + user.phone}`; 

    client.verify.services(process.env.TWILIO_VERIFY_SERVICE_ID)
    .verifications
    .create({to: phoneNumber, channel: 'sms'})
    .then(verification => res.json({
        message: `Phone successfully updated, verification OTP sent to ${verification.to}`
    }))
    .catch((err) => {
        return res.json(error([err]));
    });
}

// delete the user
exports.deleteUserById = async (req, res) => {
    if(req.user.isAdmin) res.status(405).json(error(["Users with admin access cannot delete themselves"]));
    let user = await User.findByIdAndDelete(req.params.id);
    if(!user) return res.status(404).json(error(["user not found"]));

    let response = {};
    response.message = `Deleted user: ${req.params.id}`;
    response.response = _.omit(user, ['password']);

    res.json(user);
}

// get client by user id
exports.getClientByUserId = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]));

    const client = await Client.find({'user': req.params.id}).populate('skills', 'title _id').exec();;

    let response = {};
    response.message = `Client account of user: ${req.params.id}`;
    response.response = client;
    res.json(response);
}

// get freelancer by user id
exports.getFreelancerByUserId = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]));

    const freelancer = await Freelancer.find({'user': req.params.id}).populate('skills', 'title _id').populate('mainSkillCategory', 'title _id image').exec();

    let response = {};
    response.message = `Freelancer account of user: ${req.params.id}`;
    response.response = freelancer;
    res.json(response);
}

//  upload routes

exports.uploadProfilePicture = async (req, res) => {  
    let user = await User.findById(req.user._id);
    if(!user) return res.status(404).json(error(["user not found"]));

    console.log(req.file)

    if(!req.file) return res.status(400).json(error(["file not found, please upload file"]))

    if(user.profilePicture) {
        let url = new URL(user.profilePicture);
        let objectKey = url.pathname.slice(1);

        deleteFile(objectKey, function(response) {
            if(!response.status) res.status(500).json({'error': 'internal server error, cannot delete file'});
            console.log('file deleted');
        });
    }

    user.profilePicture = req.file.location;
    user = await user.save();

    const token = user.generateAuthToken();
    res.cookie("token", token, {expires: new Date(Date.now() + 604800000), httpOnly: true});
    
    const response = {
        message: 'Profile picture successfully uploaded',
        token: token,
        result: {
            user: _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'profilePicture'])
        }
    }

    res.json(response);
}

//  upload routes

exports.deleteProfilePicture = async (req, res) => {  
    let user = await User.findById(req.user._id);
    if(!user) return res.status(404).send("User not found");

    const keyElements = user.profilePicture.split('/').slice(-3);
    const objectKey = `${keyElements[0]}/${keyElements[1]}`;

    if(!user.profilePicture) return res.status(404).json(error(["profile picture not set"]));

    deleteFile(objectKey, function(response) {
        if(!response.status) res.status(500).json(error(["internal server error, cannot delete the file"]));
        console.log('file deleted');
    });

    user.profilePicture = '';
    user = await user.save();

    const token = user.generateAuthToken();
    res.cookie("token", token, {expires: new Date(Date.now() + 604800000), httpOnly: true});
    
    const response = {
        message: 'Profile picture successfully deleted',
        token: token,
        result: {
            user: _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'profilePicture'])
        }
    }

    res.json(response);
}

// profile completion status

exports.profileCompletionStatus = (req, res) => {

}