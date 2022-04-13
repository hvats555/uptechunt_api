// refer https://firebase.google.com/docs/cloud-messaging/send-message for message argument body.
// call sendPushNotification() function to send notifications, pass notification and registration token in message body.
 
const admin = require("firebase-admin");
const serviceAccount = require('@root/firebaseNotificationKeys.json');

exports.sendPushNotification = (message) => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    admin.messaging().send(message)
    .then((response) => {
        console.log('Successfully sent message:', response);
    })
    .catch((error) => {
        if(error.code === 'messaging/invalid-argument' || error.code === 'unregistered' || error.code === 'messaging/unregistered') {
            // remove the token from database and ask new token.
        }

    });
}