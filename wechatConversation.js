
const PureCloudChat = require('./purecloud-chat.js');
const { DialogflowConnector } = require('./helpers/dialogflowConnector');
const sqlConnector = require('./sqlServerConnector');
const { WechatClient } = require('messaging-api-wechat');
const client = WechatClient.connect({
    appId: 'wxe4bdc563059c0b6a',
    appSecret: 'e49856a53b8a056731ad7cbece052851',
});

const sendTextMessage = (senderId, text) => {
    client.sendText(senderId, text);
};

/*const sendImage = (senderId, mediaId) => {
    client.sendImage(senderId, mediaId);

};

const sendAudio = (senderId, mediaId) => {
    client.sendVoice(senderId, mediaId);
}

const sendVideo = (senderId, mediaId) => {
    console.log("V3");
    client.sendVideo(senderId, mediaId);
}*/



const sendAttachment = (senderId, type, mediaId) => {
    console.log('senderId', senderId);
    switch (type) {
        case 'image':
            client.sendImage(senderId, mediaId);
            break;
        case 'audio':
            client.sendVoice(senderId, mediaId);
            break;
        case 'video':
            client.sendVideo(senderId, mediaId);
            break;
        case 'file':
            break;
        default:
            console.log("attachment null");
    }





}

//const fs = require('fs');
//const buffer = fs.readFileSync('./welcome.jpg');

class WhatsappConversation {
    constructor(senderId) {
        this.senderId = senderId;
        this.welcome = false;
        this.language = null;
        this.purecloud = false;
        this.agentJoined = false;
        this.storageObject = {};
        this.history = [];
        this.dialogflow = new DialogflowConnector(this, "WECHAT");
    }

    getSenderId() {
        return this.senderId;
    }

    getState() {
        return this.purecloud;
    }

    setStateToBot() {
        this.purecloud = false;
    }


    receiveRequest(data, res) {
        this.history.push('Customer:\t' +data.Content);
        if (this.purecloud == false) {
            sqlConnector.insertDialog(this.senderId, 'Client', 'Bot', data.Content, new Date());
        }
        else {
            sqlConnector.insertDialog(this.senderId, 'Client', 'PureCloud', data.Content, new Date());
        }

        if (this.welcome == false) {
            this.sendResponseToClient('你好！ 歡迎使用機器人\nHello! Welcome to use the bot', 'Bot')
            this.history.push('Bot:\t' + '你好！ 歡迎使用機器人\nHello! Welcome to use the bot');
            this.welcome = true;
            this.dialogflow.sendResponse('show language choices');
        }
        else if (this.language == null) {
            this.dialogflow.checkLanguage(data.Content);

        }

        else if (this.purecloud == false) {
            if (data.Content) {
                this.dialogflow.sendResponse(data.Content, this.language);
            }
        }
        else {
            if (data.Content) {
                PureCloudChat.sendMessageToPureCloud(data.Content, this.storageObject);
            }
        }
        res.status(200).end();
    }

    sendResponseToClient(text, source) {
        sqlConnector.insertDialog(this.senderId, source, 'Client', text, new Date());
        sendTextMessage(this.senderId, text)

    }

    sendAttachmentToClinet(type, url, mediaId, source) {
        console.log(mediaId);
        sendAttachment(this.senderId, type, mediaId);
    }

    connectToAgent() {
        PureCloudChat.startChat(this.storageObject, this, this.senderId);
        // PureCloudChat.sendMessageToPureCloud(this.buildHistory(this.history), this.storageObject);
    }

}
module.exports = WhatsappConversation;