import {
  baseUrlP
} from './baseUrl'
import {
  formatTime
} from './formatDate'
var app = getApp();
//小程序登录
function login() {
  let openid = wx.getStorageSync('openid');
  return new Promise(function (resolve, reject) {
    if (openid == '' || openid == null) {
      wx.login({
        success: (res) => {
          let url = baseUrlP + '/getUserOpenId'
          let parms = {
            js_code: res.code,
            appid: 'wx1fc626fdcd5f58db'
          }
          wx.request({
            url: url,
            data: parms,
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            method: 'GET',
            success: (res) => {
              if (res.data.code == 200) {
                wx.setStorageSync('openid', res.data.data.openid);
                wx.setStorageSync('deviceId', res.data.data.openid);
                resolve(res.data.data.openid);
              } else {
                reject(false);
              }
            },
            fail: (res) => {
              reject(res)
            }
          });
        },
        fail: (res) => {
          reject(false);
        },
      })
    } else {
      app.globalData.deviceId = openid;
      wx.setStorageSync('deviceId', openid);
      resolve(openid);
    }
  });
}
//图片添加水印
function watermark(file, that,index=0) {
  wx.showLoading({
    title: '请稍后..',
    mask: true
  })
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: file,
      success:function(res){
        let imgInfo = res
        that.setData({
          ['canvas1.width']:imgInfo.width,
          ['canvas1.height']:imgInfo.height
        });
        let image = that.data.canvas1.createImage();
        image.src = res.path;
        image.onload = () => {
          that.data.ctx1.drawImage(image, 0, 0, imgInfo.width, imgInfo.height);
          that.data.ctx1.font = '16px';
          that.data.ctx1.textAlign = 'left';
          that.data.ctx1.fillStyle = "rgba(204,204,204,0.6)";
          that.data.ctx1.fillText('NO.' + index, 10, imgInfo.height - 40);
          that.data.ctx1.fillText('仅用于华翔联信实名认证' + formatTime(new Date()) + ' '+app.globalData.chnlCode, 10, imgInfo.height - 20);
          setTimeout(() => {
            wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              destWidth: imgInfo.width,
              destHeight: imgInfo.height,
              canvas: that.data.canvas1,
              fileType: 'png',
              quality: 1,
              success(res) {
                wx.hideLoading();
                console.log('watermark_img', res.tempFilePath);
                resolve(res.tempFilePath);
              },
              fail(res) {
                reject(false);
              },
            }, that);
          }, 500);
        }
      },
      fail:function(){
        reject(false);
      }
    });
  });
}
module.exports = {
  login,
  watermark
}