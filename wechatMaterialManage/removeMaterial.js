var WechatAPI = require('wechat-api');
const appid = 'wxe4bdc563059c0b6a';                  //填写高级调用功能的appid
const appsecret = 'e49856a53b8a056731ad7cbece052851';

var api = new WechatAPI(appid, appsecret);
api.removeMaterial('zHUeO4FtV39Ax0dWeiAhR7ool0OWCKmdcDcGcetpgcI', function (err, data, res) {

    console.log('error', err);
    console.log('data', data);
    console.log('res', res);


});