
const wechat = require('wechat');
    const config = {
        token: 'whateveryoulike',
        appid: 'wxe4bdc563059c0b6a',
        // encodingAESKey: ''
    };

module.exports = wechat(config, function (req, res, next) {
    // All WeChat related info are in req.weixin
    var message = req.weixin;
    console.log(message);
    // Wechat expects you to respond, or else it will tell the user that the service is unavailable after three tries.
    res.reply(message);
    // Doc: https://github.com/node-webot/wechat/blob/master/README.en.md
})