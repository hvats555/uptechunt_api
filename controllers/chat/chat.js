const PubNub = require("pubnub");

var pubnub = new PubNub({
    publishKey: process.env.PUBNUB_PUBLISH_KEY,
    subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
    uuid: "123",
    secretKey: "sec-c-MDc3MmZjOTYtOGFiOS00OWIxLTgxZTEtNDJkYzViZDMwMDA3",
    heartbeatInterval: 0
});

exports.setChannelMembers = async (req, res) => {
    const {freelancerUUID, clientUUID} = req.body;

    if(!freelancerUUID || !clientUUID ) return res.status(400).json(error(["freelancerUUID or clientUUID not provided"])); 

    const pubnubResponse = await pubnub.objects.setChannelMembers({
        channel: `direct.${clientUUID}.${freelancerUUID}`,
        uuids: [clientUUID, freelancerUUID]
    });
    
    let response = {
        message: `PN response`,
        response: pubnubResponse.data,
    };

    res.json(response);
}