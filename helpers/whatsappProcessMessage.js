const API_AI_TOKEN = 'f5c75a10c8fb4c079ea43ec4baa34cdb';
const apiAiClient = require('apiai')(API_AI_TOKEN);
const FACEBOOK_ACCESS_TOKEN = 'EAAe9imZCZB8OwBALiNi7Xn3e6uurk4ujsPAKBharoZBiFsVZCk75n5vI5eszBFcWxeCDEknFTTZA3tQZCyZBAlyXfohdMMXDWfqIFCIeutx2v82aUNBj3IwYnz49aBlabmolxAfwTCywoL415KoMR3HCkXN56yZCsAd4t4EHC4BD2QZDZD';
const request = require('request');

const accountSid = 'ACb8748902c4d2c18d945bdce2b49cabe7';
const authToken = 'd5a75aa3faa2c4be08808985da11c8f8';
const client = require('twilio')(accountSid, authToken);

const sendTextMessage = (senderId, text) => {

    client.messages
      .create({
         from: 'whatsapp:+14155238886',
         body: text,
         to: senderId
       })
      .then(message => console.log(message.sid));

};

module.exports = (conversation, body) => {

    //const senderId = event.sender.id;
    //const message = event.message.text;
    const senderId = body.From;
    const message = body.Body;
    const apiaiSession = apiAiClient.textRequest(message, { sessionId: 'crowdbotics_bot' });
    
    console.log('senderId', senderId);
    console.log('body.Body', body.Body);

    //console.log('apiaiSession', apiaiSession.request._events.response.listener);
    apiaiSession.on('response', (response) => {
        //console.log('apiaiSession', apiaiSession);
        //console.log('intentName', response.result.metadata.intentName);

        const result = response.result.fulfillment.speech;
        console.log(result)
        sendTextMessage(senderId, result);
        var intent = response.result.metadata.intentName;
        if (intent == 'Operator Request'){
            conversation.connectToAgent();
        }

    });
    apiaiSession.on('error', error => console.log(error));
    apiaiSession.end();
};