
//#region Requires

const request = require('request');                             // used to send https requests
const WebSocket = require('ws');                                // used to subscribe to web socket

//const processMesage = require('./helpers/processMessage.js');
//#endregion

//#region PureCloud org settings

const organizationId = "a363a079-12a3-4d87-9927-2552d0619a04";  // organizationId
const deploymentId = "48dfab75-2d1f-4b34-9cfe-1ded1c7657bd";    // deploymentId from PureCloud org definition
const queueName = "josq";                             // queueName where Chat will be routed
const env = 'mypurecloud.com';                                 // PureCloud environment (mypurecloud.com / mypurecloud.ie)

//#endregion /PureCloud org settings

// Start a chat
function startChat(storageObject, conversation, senderID) {

  return new Promise((resolve, reject) => {
    let myBody = {
      "organizationId": organizationId,
      "deploymentId": deploymentId,
      "routingTarget": {
        "targetType": "QUEUE",
        "targetAddress": queueName
      },
      "memberInfo": {
        "displayName": "Steve Jobs",
        "profileImageUrl": "https://banner2.kisspng.com/20181201/xes/kisspng-call-centre-customer-service-clip-art-computer-ico-homepage-vacuum-5c02fa4fe698b1.3075985415436990239445.jpg",
        "customFields": {
          "firstName": "Steve",
          "lastName": "Jobs"
        }
      }
    };

    let options = {
      url: 'https://api.' + env + '/api/v2/webchat/guest/conversations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(myBody)
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        var webSocket = new WebSocket(info.eventStreamUri);
        webSocket.on('open', function () {
          //Connection is open. Start the subscription(s)
          console.log('WebSocket opened');
        });

        webSocket.on('message', function (message) {
          var data = JSON.parse(message);
          // We do not care about channel.metadata messages. Ignore them.
          if (data.topicName == 'channel.metadata') {
            return;
          }

          try {
            if (conversation.purecloud == false) {
              // do only once after chat session initated. Save particiapnt data and other required informations      
              storageObject.purecloud = {};
              storageObject.purecloud.conversationId = data.eventBody.conversation.id;
              storageObject.purecloud.agentId = info.member.id;
              storageObject.purecloud.chatId = info.jwt;
              conversation.purecloud = true;
              sendMessageToPureCloud(buildHistory(conversation.history), storageObject);
              resolve(storageObject);
            }

            // new message from purecloud received
            if (data.metadata.type == 'message') {

              // We do not want to display message from the bot again (echo)
              // display only messages where senderId is different than current botId
              if (data.eventBody.sender.id != storageObject.purecloud.agentId) {
                if (data.eventBody.body != "") {
                  console.log('msg from pc:', data.eventBody.body);
                  conversation.sendResponseToClient(data.eventBody.body, 'PureCloud');
                }
                else if (data.eventBody.bodyType == "member-leave") {
                  if (conversation.agentJoined == false) {
                    conversation.sendResponseToClient('[Agent Joined]', 'PureCloud');
                    conversation.agentJoined = true;
                  }
                }
              }
              // member-change event (detect DISCONNECT event)
            }
            else if (data.metadata.type == 'member-change' && data.eventBody.member.id == storageObject.purecloud.agentId && data.eventBody.member.state == 'DISCONNECTED') {
              console.log('# chat disconnected, clear bot session');
              storageObject.purecloud = undefined;
              conversation.agentJoined = false;
              conversation.sendResponseToClient('[purecloud disconnected]', 'PureCloud');
              conversation.setStateToBot();
              //storageObject.disconnect();
            }

          } catch (error) {
            console.log(error);
            reject(error);
          }
        });
      }
    });
  });
}

// Send message to purecloud
function sendMessageToPureCloud(_msg, _data, _conversationID) {
  let myBody = {
    body: _msg,
    bodyType: 'standard'
  };

  let options = {
    url: 'https://api.' + env + '/api/v2/webchat/guest/conversations/' + _data.purecloud.conversationId + '/members/' + _data.purecloud.agentId + '/messages',
    //url: 'https://api.' + env + '/api/v2/webchat/guest/conversations/' + _data.conversationId + '/members/' + _data.agentId + '/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'bearer ' + _data.purecloud.chatId
    },
    body: JSON.stringify(myBody)
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      console.log('msg sent to pc:', _msg);

    } else {
      console.log(error);
    }
  });
}

function buildHistory(_history) {
  let ret = '--- bot history ---\n'
  for (var _item in _history) {
    ret = ret + _history[_item] + '\n';
  }
  ret = ret + '--- bot history ---\n';
  return ret
}

module.exports = {
  startChat,
  sendMessageToPureCloud
};
