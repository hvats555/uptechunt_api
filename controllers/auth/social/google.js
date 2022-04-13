const User = require('@models/User');
const Client = require('@models/Client');
const Freelancer = require('@models/Freelancer');
const bcrypt = require('bcrypt');
const _ = require('lodash');

var {DateTime} = require('luxon');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const error = require('@utils/error');
const { nanoid } = require('nanoid');

const { OAuth2Client } = require('google-auth-library');

const sendEmail = require('../../notifications/sendEmail');
const requestInfo = require('@utils/requestInfo');

const profileScore = require('@utils/profileScore');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const PubNub = require("pubnub");


var admin = require("firebase-admin");

var serviceAccount = require('@root/firebaseSignin.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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

exports.googleAuth = async (req, res) => {
    const { tokenId } = req.body;
    let googleUser = null;

    try {
        googleUser = await client.verifyIdToken({idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID});
    } catch(err) {
        console.log(err);
        return res.status(403).json(error(["invalid token"]));
    }

    const googlePayload = googleUser.payload;

    if(googlePayload.email_verified) {
        const emailCheck = await User.find({'email': googlePayload.email});

        if(_.isEmpty(emailCheck)) {
            // generating some random password
            let randomPassword = googlePayload.email + nanoid();
            // encrypting the password
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(randomPassword, salt);

            const signupBody = {
                firstName: googlePayload.name.split(' ')[0],
                lastName: googlePayload.name.split(' ')[1],
                email: googlePayload.email,
                signUpMethod: 'google',
                pubnubUUID: nanoid(),
                password: password,
            }

            let user = new User(signupBody);

                // creating a freelancer account
            let freelancer = new Freelancer({'user': user._id});

            // Default subscription with 25 proposals per month
            freelancer.subscription = {
                plan: "starter",
                remainingProposalCount: 25,
                nextFreeProposalCredit: DateTime.now().plus({ months: 1 }).toFormat('dd-MM-yyyy')
            }

            freelancer = await freelancer.save();

            // creating a client account
            let client = new Client({'user': user._id});
            //client.wallet = { balance: 0, transactions: [] };
            client = await client.save();
            
            // saving user and freelancer account in user account
            user.roles.client = client._id;
            user.roles.freelancer = freelancer._id;

            await stripe.customers.create({
                name: `${user.firstName} ${user.lastName}`,
                phone: user.phone,
                email: user.email,
                metadata: {
                    user: user._id.toString()
                },
                description: `${user.firstName} ${user.lastName} customer created automatically on signup`,

                address: {
                    country: null,
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
            }).catch((err) => {
                console.log(err);
            });

            const token = user.generateAuthToken();
            res.cookie("token", token, {expires: new Date(Date.now() + 604800000), httpOnly: true});
            
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

            return res.json(response);
        } else {        
            let user = await User.findOne({email : googlePayload.email}).populate(populateQuery).exec();

            if(!user) return res.status(404).json(error(["invalid username or password"]));
                
            const token = user.generateAuthToken();
        
            res.cookie("token", token, {expires: new Date(Date.now() + 604800000), httpOnly: true});
                
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
    }
}