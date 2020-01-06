

Wechat.prototype.uploadTempMaterial = function(type,filepath){
    var that = this;
    var form = {  //构造表单
        media:fs.createReadStream('C:\\Users\\ckltam\\fb\\media\\welcome.jpg')
    }
    return new Promise(function(resolve,reject){
        that.fetchAccessToken().then(function(data){

            var url = 'https://api.weixin.qq.com/cgi-bin/media/upload?access_token=28_-G0L0VLy5qOVa1lDjIFra-bMeqADK4f0-RS5wpKXKsKUyNNyxHKLSymDxrXar0Bk5v29pNUvxH7awzUXD4ANN0HfuGEltWe8cHMByutDDmydBgubQdldegpEd9gMgecPteWgkGquw4xQ9uhIOFGiABASJK&type=image';
            request({url:url,method:'POST',formData:form,json:true}).then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data)
                }else{
                    throw new Error('upload material failed!');
                }
            }).catch(function(err){
                reject(err);
            });
        });
    });
}