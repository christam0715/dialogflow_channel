const dialogflow = require('dialogflow');
const uuid = require('uuid');
const sessionId = uuid.v4();
const projectId = 'agent-human-handoff-sample-ocq';
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: './helpers/google.json'
});
const sessionPath = sessionClient.sessionPath(projectId, sessionId);


class DialogflowConnector {
  constructor(conversation, requestSource) {
    this.conversation = conversation;
    this.requestSource = requestSource;
  };

  async checkLanguage(text) {
    var request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: 'en-US',
        },
      },
    };
    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    var intent = responses[0].queryResult.intent.displayName;
    console.log('responses[0].queryResult.intent', responses[0].queryResult.intent);
    if (intent == 'LANG_CHIN' || intent == 'Language Chinese') {
      this.conversation.language = "zh-HK";
      this.conversation.sendResponseToClient('語言已更改為中文', 'Bot');
    }
    else if (intent == 'LANG_ENG' || intent == 'Language English') {
      this.conversation.language = "en-US";
      this.conversation.sendResponseToClient('The language has changed to English', 'Bot');
    }
    else {
      this.sendResponse('show language choices');
    }



  }

  async sendResponse(text, lang) {
    if (lang == null){
      lang = 'en-US';
    }
    // The text query request.
    var request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: text,
          // The language used by the client (en-US)
          languageCode: lang
          //languageCode: 'en-US',
        },
      },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);

    var intent = responses[0].queryResult.intent.displayName;
    if (intent == 'Operator Request') {
      this.conversation.connectToAgent();
    }
    else if (intent == 'LANG_CHIN' || intent == 'Language Chinese') {
      this.conversation.language = "zh-HK";
      //this.conversation.sendResponseToClient('語言已更改為中文', 'Bot');
    }
    else if (intent == 'LANG_ENG' || intent == 'Language English') {
      this.conversation.language = "en-US";
      //this.conversation.sendResponseToClient('The language has changed to English', 'Bot');
    }



    var platform = 'PLATFORM_UNSPECIFIED'
    if (this.checkSpecified(responses[0].queryResult.fulfillmentMessages)) {
      platform = this.requestSource;
    }

    responses[0].queryResult.fulfillmentMessages.forEach(element => {
      if (element.platform == platform) {
        console.log(element);
        if (element.text) {
          var result = element.text.text[0];
          this.conversation.history.push('Bot:\t' + result);
          this.conversation.sendResponseToClient(result, 'Bot');
        }


        else if (element.payload) {

          var type = element.payload.fields.type.stringValue;
          var url = element.payload.fields.url.stringValue;
          var mediaId = element.payload.fields.mediaId.stringValue;

          this.conversation.sendAttachmentToClinet(type, url, mediaId, 'Bot');

        }
        else if (element.card) {
          let card = [];
          let buttons = [];
          for (var b = 0; b < element.card.buttons.length; b++) {
            let isLink = (element.card.buttons[b].postback.substring(0, 4) === 'http');
            let button;
            if (isLink) {
              button = {
                "type": "web_url",
                "title": element.card.buttons[b].text,
                "url": element.card.buttons[b].postback
              }
            } else {
              button = {
                "type": "postback",
                "title": element.card.buttons[b].text,
                "payload": element.card.buttons[b].postback
              }
            }
            buttons.push(button);
          }

          let variables = {
            "title": element.card.title,
            "image_url": element.card.imageUri,
            "subtitle": element.card.subtitle,
            "buttons": buttons
          };
          card.push(variables);

          this.conversation.sendSpecifiedToClient(card);

        }
      }

    });
  }


  checkSpecified(fulfillmentMessages) {
    var bool = false;
    fulfillmentMessages.forEach(message => {
      console.log('message.platform', message.platform);
      console.log('fulfillmentMessages', message);
      if (message.platform == this.requestSource) {
        bool = true;
      }
    })
    return bool;
  }






}
module.exports.DialogflowConnector = DialogflowConnector;





