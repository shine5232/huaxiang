import Toast from '../miniprogram_npm/@vant/weapp/toast/toast'
import {
  sign,
  formatISOTime,
  getPolicyEncode,
  getSignature,
  Configuration,
  getLatestUserKey,
  checkEncryptKeyUrl
} from './util'

function POST(url, param, loading = false, title = '处理中...') {
  //加载loading
  if (loading) {
    wx.showLoading({
      title: title,
      mask: true
    })
  }
  let promise = new Promise(function (resolve, reject) {
    let timestamp = new Date().getTime();
    checkEncryptKeyUrl(url).then((res)=>{
      if(res){
        getLatestUserKey().then((res)=>{
          let defaultPar = {
            'openid': wx.getStorageSync('openid'),
            'version': res.version
          };
          let params = Object.assign({}, defaultPar, param);
          wx.request({
            url: url,
            data: params,
            header: {
              "Content-Type": "application/json;charset=UTF-8",
              "sign": sign(params, timestamp, res.encryptKey),
              "timestamp": timestamp,
              "openid":wx.getStorageSync('openid'),
              "version":res.version,
              "parm": encodeURIComponent(JSON.stringify(params))
            },
            method: 'POST',
            success: (res) => {
              console.log('success',res);
              resolve(res.data);
            },
            fail: (res) => {
              console.log('fail',res);
              wx.showToast({
                title: res.errMsg,
                duration: 2000,
                icon: 'none'
              });
              reject(res)
            },
            complete: (res) => {
              if (loading) {
                wx.hideLoading()
              }
            }
          });
        });
      }else{
        let defaultPar = {};
        let params = Object.assign({}, defaultPar, param);
          wx.request({
            url: url,
            data: params,
            header: {
              "Content-Type": "application/json;charset=UTF-8",
              "sign": sign(params, timestamp),
              "timestamp": timestamp,
              "parm": encodeURIComponent(JSON.stringify(params))
            },
            method: 'POST',
            success: (res) => {
              resolve(res.data);
            },
            fail: (res) => {
              wx.showToast({
                title: res.errMsg,
                duration: 2000,
                icon: 'none'
              });
              reject(res)
            },
            complete: (res) => {
              if (loading) {
                wx.hideLoading()
              }
            }
          });
      }
    });
  });
  return promise;
}

function GET(url, param) {
  let defaultPar = {};
  let params = Object.assign({}, defaultPar, param);
  let promise = new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: params,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: 'GET',
      success: (res) => {
        resolve(res)
      },
      fail: (res) => {
        reject(res)
      }
    })
  });
  return promise;
}

function FILE(url, fileName, filePath, param, note = true, loading = false, title = '加载中...') {
  if (loading) {
    wx.showLoading({
      title: title,
      mask: true
    })
  }
  let defaultPar = {};
  let params = Object.assign({}, defaultPar, param);
  let promise = new Promise(function (resolve, reject) {
    let timestamp = new Date().getTime();
    wx.uploadFile({
      url: url,
      formData: params,
      filePath: filePath,
      name: fileName,
      header: {
        "sign": sign(params, timestamp),
        "timestamp": timestamp,
        "parm": encodeURIComponent(JSON.stringify(params))
      },
      success: (res) => {
        if (loading) {
          wx.hideLoading()
        }
        if (res.statusCode == 200) {
          if (res.data != 'null') {
            let result = JSON.parse(res.data);
            if (result.code != 200) {
              if (note) {
                wx.showToast({
                  title: result.msg,
                  icon: 'none'
                });
              }
              reject(result)
            } else {
              resolve(result)
            }
          } else {
            wx.showToast({
              title: '检测失败',
              icon: 'none'
            });
            reject(false)
          }
        } else {
          //Toast.fail('服务器处理失败')
          reject(false)
        }
      },
      fail: (res) => {
        if (loading) {
          wx.hideLoading()
        }
        //Toast.fail('网络请求超时')
        reject(false)
      },
      complete: (res) => {
        if (loading) {
          wx.hideLoading()
        }
      }
    })
  });
  return promise;
}

function OBSupload(filePath, fileName, loading = false, title = "文件上传中...") {
  let promise = new Promise(function (resolve, reject) {
    if (!filePath) {
      wx.showToast({
        title: '没有上传的文件',
        icon: 'Fail',
      });
      reject(false);
    } else {
      const OBSPolicy = { // 设定policy内容，policy规则定义可参考步骤3中的超链接签名计算规则文档
        "expiration": formatISOTime(new Date()),
        "conditions": [{
            "bucket": "hx-zhangting"
          }, // 桶名要和配置文件中endpoint中的桶名保持一致
          {
            'key': fileName
          },
        ]
      }
      console.log('OBSPolicy', OBSPolicy);
      const policyEncoded = getPolicyEncode(OBSPolicy); // 计算base64编码后的policy
      const signature = getSignature(policyEncoded, Configuration.SecretKey); // 计算signature
      wx.uploadFile({
        url: Configuration.EndPoint,
        filePath: filePath,
        name: 'file',
        header: {
          'content-type': 'multipart/form-data;',
        },
        formData: {
          // 从配置文件中获取到的AK信息、计算得到的编码后policy及signature信息
          'AccessKeyID': Configuration.AccessKeyId,
          'policy': policyEncoded,
          'signature': signature,
          'key': fileName,
        },
        success: function (res) {
          console.log(res.statusCode); //打印响应状态码
          if (res.statusCode == '204') {
            console.log('Uploaded successfully', res)
            wx.showToast({
              title: '上传成功',
              icon: 'Success'
            });
            resolve(res);
          } else {
            console.log('Uploaded failed', res)
            wx.showToast({
              title: '上传失败',
              icon: 'Fail'
            });
            reject(false);
          }
        },
        fail: function (e) {
          console.log(e);
          reject(false);
        }
      })
    }
  });
  return promise;
}
module.exports = {
  POST,
  GET,
  FILE,
  OBSupload
}