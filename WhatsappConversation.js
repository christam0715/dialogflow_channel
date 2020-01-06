const WhatsappProcessMessage = require('./helpers/WhatsappProcessMessage');
const PureCloudChat = require('./purecloud-chat.js');
const { DialogflowConnector } = require('./helpers/dialogflowConnector');
const sqlConnector = require('./sqlServerConnector');

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

const sendAttachment = (senderId, url) => {

    client.messages
        .create({
            from: 'whatsapp:+14155238886',
            mediaUrl: url,
            to: senderId
        })
        .then(message => console.log(message.sid));
};

class WhatsappConversation {
    constructor(senderId) {
        this.senderId = senderId;
        this.welcome = false;
        this.language = null;
        this.purecloud = false;
        this.agentJoined = false;
        this.storageObject = {};
        this.history = [];
        this.dialogflow = new DialogflowConnector(this, "WHATSAPP");
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


    receiveRequest(req, res) {
        this.history.push('Customer:\t' + req.body.Body);
        if (this.purecloud == false) {
            sqlConnector.insertDialog(this.senderId, 'Client', 'Bot', req.body.Body, new Date());
        }
        else {
            sqlConnector.insertDialog(this.senderId, 'Client', 'PureCloud', req.body.Body, new Date());
        }

        if (this.welcome == false) {
            this.sendResponseToClient('你好！ 歡迎使用機器人\nHello! Welcome to use the bot', 'Bot')
            this.history.push('Bot:\t' + '你好！ 歡迎使用機器人\nHello! Welcome to use the bot');
        //    this.showLanguageChoice();
            this.welcome = true;
            this.dialogflow.sendResponse('show language choices');

        }
        else if (this.language == null) {
            this.dialogflow.checkLanguage(req.body.Body);
        }
        else if (this.purecloud == false) {
            if (req.body.Body) {
                this.dialogflow.sendResponse(req.body.Body, this.language);
            }
        }
        else {
            if (req.body.Body) {
                PureCloudChat.sendMessageToPureCloud(req.body.Body, this.storageObject);
            }
        }
        res.status(200).end();
    }

    sendResponseToClient(text, source) {
        sqlConnector.insertDialog(this.senderId, source, 'Client', text, new Date());
        sendTextMessage(this.senderId, text)
    }

    sendAttachmentToClinet(type, url, mediaId, source) {
        sendAttachment(this.senderId, url);
    }

    connectToAgent() {
        PureCloudChat.startChat(this.storageObject, this, this.senderId);
    }


}
module.exports = WhatsappConversation;