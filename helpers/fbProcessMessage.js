const API_AI_TOKEN = 'f5c75a10c8fb4c079ea43ec4baa34cdb';
const apiAiClient = require('apiai')(API_AI_TOKEN);
const FACEBOOK_ACCESS_TOKEN = 'EAAe9imZCZB8OwBALiNi7Xn3e6uurk4ujsPAKBharoZBiFsVZCk75n5vI5eszBFcWxeCDEknFTTZA3tQZCyZBAlyXfohdMMXDWfqIFCIeutx2v82aUNBj3IwYnz49aBlabmolxAfwTCywoL415KoMR3HCkXN56yZCsAd4t4EHC4BD2QZDZD';
const request = require('request');
const sendTextMessage = (senderId, text) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: { text },
        }
    });
};

module.exports = (conversation, event) => {
    const senderId = event.sender.id;
    const message = event.message.text;
    const apiaiSession = apiAiClient.textRequest(message, { sessionId: 'crowdbotics_bot' });
    //console.log('apiaiSession', apiaiSession.request._events.response.listener);
    apiaiSession.on('response', (response) => {
        //console.log('apiaiSession', apiaiSession);
        //console.log('intentName', response.result.metadata.intentName);
        const result = response.result.fulfillment.speech;
        sendTextMessage(senderId, result);
        var intent = response.result.metadata.intentName;
        if (intent == 'Operator Request'){
            conversation.connectToAgent();
        }

    });
    apiaiSession.on('error', error => console.log(error));
    apiaiSession.end();
};