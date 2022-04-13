const User = require('@models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const sendEmail = require('@controllers/notifications/sendEmail');
const error = require('@utils/error');

exports.sendPasswordResetLink = async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(404).json(error(["no user found with given email id"]));

    const token = jwt.sign({_id: user._id}, process.env.PASSWORD_RESET_TOKEN_SECRET, {expiresIn: '20m'});

    const resetLink = `${process.env.CLIENT_URL}/password-reset/${token}`;

    user.passwordResetToken = token;
    user.save();


    sendEmail({
        to: [
            {email: user.email}
        ],

        dynamicTemplateData: {
            firstName: user.firstName,
            passwordResetLink: resetLink
        },

        templateId: process.env.PASSWORD_RESET_MAIL_TEMPLATE
    });


    res.json({
        message: "email send with reset link",
        link: resetLink
    })
}

exports.resetPassword = async (req, res) => {
    const token = req.params.token;

    jwt.verify(token, process.env.PASSWORD_RESET_TOKEN_SECRET, async (err, decodedToken) => {
        if(!err) {
            const user = await User.findOne({passwordResetToken: token});
            console.log(token);
            if(!user) return res.status(400).json(error(["user with given token dosent exist"]));
        
            // encrypting the password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.newPassword, salt);
        
            // set password reset token to null again, so that it cannot be user again
            user.passwordResetToken = null;
            user.save();

            sendEmail({
                to: [
                    {email: user.email}
                ],
        
                dynamicTemplateData: {
                    firstName: user.firstName
                },
        
                templateId: process.env.PASSWORD_RESET_MAIL_TEMPLATE
            });

            res.json({
                "message": "password reset successfull"
            });

        } else {
            return res.status(401).json(error([err]));
        }
    });
}