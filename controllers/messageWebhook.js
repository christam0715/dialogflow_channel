const wechat = require('node-wechat')('whateveryoulike');

const FbConversation = require('../fbConversation');
const WechatConversation = require('../wechatConversation');
const WhatsappConversation = require('../whatsappConversation');


var facebookArray = [];
var wechatArray = [];
var whatsappArray = [];


module.exports = (req, res) => {

    console.log('req', req.headers["user-agent"]);
    if (req.headers["user-agent"] == "facebookexternalua") {
        senderId = req.body.entry[0].messaging[0].sender.id;
        if (facebookArray.length == 0) {
            var conversation = new FbConversation(senderId);
            facebookArray.push(conversation);
            conversation.receiveRequest(req, res);
        }
        else {
            var conversation = findFbConversation(senderId);
            if (conversation == null) {
                conversation = new FbConversation(senderId);
                facebookArray.push(conversation);
                conversation.receiveRequest(req, res);
            }
            else {
                conversation.receiveRequest(req, res);
            }
        }
    }

    else if (req.headers["user-agent"] == "TwilioProxy/1.1") {
        senderId = req.body.From;
        if (whatsappArray.length == 0) {
            var conversation = new WhatsappConversation(senderId);
            whatsappArray.push(conversation);
            conversation.receiveRequest(req, res);
        }
        else {
            var conversation = findWhatsappConversation(senderId);
            if (conversation == null) {
                conversation = new WhatsappConversation(senderId);
                whatsappArray.push(conversation);
                conversation.receiveRequest(req, res);
            }
            else {
                conversation.receiveRequest(req, res);
            }
        }
    }
    else if (req.headers["user-agent"] == "Mozilla/4.0") {
        wechat.checkSignature(req, res);
        wechat.handler(req, res);

        wechat.text(function (data) {
            console.log('data', data);
            senderId = data.FromUserName;
            console.log('senderId', senderId);
            if (wechatArray.length == 0) {
                var conversation = new WechatConversation(senderId);
                wechatArray.push(conversation);
                conversation.receiveRequest(data, res);
            }
            else {
                var conversation = findWechatConversation(senderId);
                if (conversation == null) {
                    conversation = new WechatConversation(senderId);
                    wechatArray.push(conversation);
                    conversation.receiveRequest(data, res);
                }
                else {
                    conversation.receiveRequest(data, res);
                }
            }
        });
    }
};

function findFbConversation(customerId) {
    var i;
    for (i = 0; i < facebookArray.length; i++) {
        if (customerId == facebookArray[i].getSenderId()) {
            return facebookArray[i];
        }
    }
    return null;
}

function findWechatConversation(customerId) {
    var i;
    for (i = 0; i < wechatArray.length; i++) {
        if (customerId == wechatArray[i].getSenderId()) {
            return wechatArray[i];
        }
    }
    return null;
}

function findWhatsappConversation(customerId) {
    var i;
    for (i = 0; i < whatsappArray.length; i++) {
        if (customerId == whatsappArray[i].getSenderId()) {
            return whatsappArray[i];
        }
    }
    return null;
}