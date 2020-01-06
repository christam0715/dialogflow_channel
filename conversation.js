const fbProcessMessage = require('./helpers/fbProcessMessage');
const PureCloudChat = require('./purecloud-chat.js');


class FbConversation {
    constructor(senderID) {
        console.log('CsenderID', senderID);
        this.senderID = senderID;
        this.purecloud = false;
        this.storageObject = {};
    }

    getSenderID() {
        return this.senderID;
    }

    getState() {
        return this.purecloud;
    }

    setStateToBot(){
        this.purecloud = false;
    }


    receiveRequest(req, res) {
        //console.log('req.body.entry', req.body.entry[0].messaging[0].sender.id);

        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                console.log('event', event);
                if (this.purecloud == false) {
                    if (event.message && event.message.text) {
                        console.log('event.message.text', event.message.text);

                        fbProcessMessage(this, event);
                    }
                }
                else {
                    if (event.message) {
                        PureCloudChat.sendMessageToPureCloud(event.message.text, this.storageObject);
                    }
                }
            });
        });

        res.status(200).end();
    }

    connectToAgent() {
        this.purecloud = true;
        PureCloudChat.startChat(this.storageObject, this, this.senderID);
    }


}
module.exports = FbConversation;