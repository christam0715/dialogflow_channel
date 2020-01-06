
const API_AI_TOKEN = 'f5c75a10c8fb4c079ea43ec4baa34cdb';
const APIAI_LANG = 'en';


const apiAiClient = require('apiai')(API_AI_TOKEN, {language: APIAI_LANG, requestSource: "fb"});
const request = require('request');

class DialogflowConnector {
    constructor(conversation) {
        this.conversation = conversation;
    };
    sendResponse(text) {
        var message = text;
        const apiaiSession = apiAiClient.textRequest(message, { sessionId: 'crowdbotics_bot' });
        apiaiSession.on('response', (response) => {



            console.log('response', response);

            var intent = response.result.metadata.intentName;
            if (intent == 'Operator Request') {
                this.conversation.connectToAgent();
            }


            response.result.fulfillment.messages.forEach(element => {
                console.log(element);
                if (element.speech) {
                    var result = element.speech;
                    this.conversation.history.push('Bot:\t' + result);
                    this.conversation.sendResponseToClient(result, 'Bot');
                }
                else if(element.payload){
                        var type = element.payload.type;
                        var url = element.payload.url;
                        var mediaId = element.payload.mediaId
                        this.conversation.sendAttachmentToClinet(type, url, mediaId, 'Bot');


                    /*if (element.payload.type == 'image'){

                        this.conversation.sendImageToClient(url, mediaId, 'Bot');
                    }
                    else if (element.payload.type == 'audio'){
                        var url = element.payload.url;
                        var mediaId = element.payload.mediaId;
                        this.conversation.sendAudioToClient(url, mediaId, 'Bot');
                    }
                    else if (element.payload.type == 'video'){
                        var url = element.payload.url;
                        var mediaId = element.payload.mediaId;
                        this.conversation.sendVideoToClient(url, mediaId, 'Bot');
                    } 
                    else if (element.payload.type == 'file'){
                        var url = element.payload.url;
                        var mediaId = element.payload.mediaId;
                        this.conversation.sendFileToClient(url, mediaId, 'Bot');
                    }*/
                    
                }



            });

            //console.log('response.result.fulfilment.messages', response.result.fulfillment.messages[1]);

            //var result = response.result.fulfillment.speech;
            //var intent = response.result.metadata.intentName;
            //if (intent == 'Operator Request') {
            //    this.conversation.connectToAgent();
            //}
            //this.conversation.history.push('Bot:\t' + result);
            //this.conversation.snedResponseToClient(result, 'Bot');
        });
        apiaiSession.on('error', error => console.log(error));
        apiaiSession.end();

    }
}
module.exports.DialogflowConnector = DialogflowConnector;









