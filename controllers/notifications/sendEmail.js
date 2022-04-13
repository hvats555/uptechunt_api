const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_SECRET_KEY);

const sendEmail = (msg) => {
    sgMail
        .send({
            to: msg.to,
            from: process.env.FROM_EMAIL,
            personalizations:[{
                to: msg.to,
                dynamic_template_data: msg.dynamicTemplateData,
            }],

            templateId: msg.templateId,
        })
        .then(() => {
            console.log("Email successfully send");
        })
        .catch((error) => {
            console.log(error.response.body);
        });
}

module.exports = sendEmail;