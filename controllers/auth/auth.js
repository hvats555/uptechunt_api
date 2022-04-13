const User = require('@models/User');
const Client = require('@models/Client');
const Freelancer = require('@models/Freelancer');
const Wallet = require('@models/Wallet');
const bcrypt = require('bcrypt');
const _ = require('lodash');

var {DateTime} = require('luxon');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const error = require('@utils/error');
const { nanoid } = require('nanoid');

const { OAuth2Client } = require('google-auth-library');

const sendEmail = require('@controllers/notifications/sendEmail');
const requestInfo = require('@utils/requestInfo');

const profileScore = require('@utils/profileScore');
const Onboarding = require('@models/Onboarding');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const PubNub = require("pubnub");

exports.signup = async (req, res) => {
    const emailCheck = await User.find({'email': req.body.email});
    if(!(_.isEmpty(emailCheck))) { 
        return res.status(409).json(error(["email already in use"])); 
    }

    const signUpBody = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        email: req.body.email,
        country: req.body.country,
        countryCode: req.body.countryCode,
        password: req.body.password,
        pubnubUUID: nanoid(),
        signUpMethod: 'custom'
    }

    let user = new User(signUpBody);

    // creating a freelancer account
    let freelancer = new Freelancer({'user': user._id});

    // Default subscription with 25 proposals per month
    freelancer.subscription = {
        plan: "starter",
        remainingProposalCount: 25,
        nextFreeProposalCredit: DateTime.now().plus({ months: 1 }).toFormat('dd-MM-yyyy')
    }
    
    freelancer = await freelancer.save();

    let onboarding = new Onboarding({_id: freelancer._id});
    onboarding.save();

    // creating a client account
    let client = new Client({'user': user._id});
    //client.wallet = { balance: 0, transactions: [] };
    client = await client.save();

    // creating freelancer wallet
    let wallet = new Wallet({
        'freelancer': freelancer._id
    });

    wallet.save();
    
    // saving user and freelancer account in user account
    user.roles.client = client._id;
    user.roles.freelancer = freelancer._id;

    // encrypting the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    
    await stripe.customers.create({
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        email: user.email,
        metadata: {
            user: user._id.toString()
        },
        description: `${user.firstName} ${user.lastName} customer created automatically on signup`,

        address: {
            country: user.country,
        }
    }).then((customer) => {
        user.stripeId = customer.id;
    }).catch((err) => {
        console.log(err);
    });

    await user.save();

    // registering the user on pubnub

    const pubnub = new PubNub({
        publishKey: process.env.PUBNUB_PUBLISH_KEY,
        subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
        uuid: user.pubnubUUID,
    });

    // using passed in UUID
    await pubnub.objects.setUUIDMetadata({
        uuid: user.pubnubUUID,
        data: { 
            name: `${user.firstName} ${user.lastName}`,
            externalId: user._id,
            email: user.email,
        }
    }).then((res) => {
        console.log(res);
    }).catch((err) => {
        console.log(err);
    });

    // returning response populated with freelancer and client 

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
        },{
           path: 'mainSkillCategory',
           model: 'SkillCategory',
           select: 'title _id image'
       }]
      }]

    const token = user.generateAuthToken();
    // res.cookie("token", token, {expires: new Date(Date.now() + 604800000), httpOnly: true});
    
    user = await User.findById(user._id).populate(populateQuery).exec();

    let response = {
        message: `Created new user: ${user._id}`,
        token: token,
        response: _.omit(user.toObject(), ['password', 'roles.client.user', 'roles.freelancer.user'])
    };

    if(process.env.NODE_ENV == "production") {
        sendEmail({
            to: user.email,
            subject: 'Welcome from Get India Work',
            text: 'You have successfully signup for Get india work',
            html: '<h1>You have successfully signup for Get india work</h1>'
        })
    }


    res.json(response);
}

exports.signin = async (req, res) => {  
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
         },{
            path: 'mainSkillCategory',
            model: 'SkillCategory',
            select: 'title _id image'
        }]
      }]

    let user = await User.findOne({email : req.body.email}).populate(populateQuery).exec();
    if(!user) return res.status(404).json(error(["invalid username or password"]));

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) { return res.status(401).json(error(["invalid username or password"])); }

    const token = user.generateAuthToken();

    // res.cookie("token", token, {expires: new Date(Date.now() + 604800000), httpOnly: true});

    // if(process.env.NODE_ENV == 'production') {
    //     // fetching the request information like device, location os and saving it into the db
    //     const reqInfo = await requestInfo(req);
    //     user.signInHistory.push({
    //         ip: reqInfo.ip,
    //         os: reqInfo.os,
    //         device: reqInfo.device,
    //         agent: reqInfo.agent
    //     });
    // }


    user.save();
    
    // sendEmail();
    // Fill up dynamic template data

    // preparing the response
    let response = {};
    response.message = `Successful login`;
    response.token = token;
    response.response = _.omit(user.toObject(), ['password', 'roles.client.user', 'roles.freelancer.user']);

    response.profileCompleteness = profileScore(user.toObject());

    res.json(response);
}

exports.adminSignin = async (req, res) => {  
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
         },{
            path: 'mainSkillCategory',
            model: 'SkillCategory',
            select: 'title _id image'
        }]
      }]

    let user = await User.findOne({email : req.body.email}).populate(populateQuery).exec();
    if(!user) return res.status(404).json(error(["invalid username or password"]));

    if(!user.isAdmin) return res.status(404).json(error(["authentication failed"]));

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(401).json(error(["invalid username or password"]));

    const token = user.generateAuthToken();

    res.cookie("token", token, {expires: new Date(Date.now() + 604800000), httpOnly: true});

    // if(process.env.NODE_ENV == 'production') {
    //     // fetching the request information like device, location os and saving it into the db
        // const reqInfo = await requestInfo(req);
    //     user.signInHistory.push({
    //         ip: reqInfo.ip,
    //         os: reqInfo.os,
    //         device: reqInfo.device,
    //         agent: reqInfo.agent
    //     });
    // }


    user.save();
    
    // sendEmail();
    // Fill up dynamic template data

    // preparing the response
    let response = {};
    response.message = `Successful login`;
    response.token = token;
    response.response = _.omit(user.toObject(), ['password', 'roles.client.user', 'roles.freelancer.user']);

    response.profileCompleteness = profileScore(user.toObject());

    res.json(response);
}

exports.signout = (req, res) => {
    res.clearCookie('token');
    res.json({
        message: "User signout",
        response: {}
    })
}