import {
  baseUrlP
} from './baseUrl'
import {
  formatTime
} from './formatDate'
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
function watermark(file, that) {
  return new Promise(async (resolve, reject) => {
    const imgInfo = await wx.getImageInfo({
      src: file
    });
    that.data.canvas1.width = imgInfo.width;
    that.data.canvas1.height = imgInfo.height;
    const image = that.data.canvas1.createImage();
    image.src = file;
    image.onload = () => {
      that.data.ctx1.fillRect(0, 0, imgInfo.width, imgInfo.height);
      that.data.ctx1.drawImage(image, 0, 0, imgInfo.width, imgInfo.height);
      that.data.ctx1.font = '24px sans-serif';
      that.data.ctx1.textAlign = 'left';
      that.data.ctx1.fillStyle = "#cccccc";
      that.data.ctx1.globalAlpha = 0.3;
      that.data.ctx1.fillText('仅用于华翔联信实名认证' + formatTime(new Date()) + ' D300000169', 10, imgInfo.height - 50);
      wx.canvasToTempFilePath({
        canvas: that.data.canvas1,
        fileType: 'jpg',
        quality: 1,
        success(res) {
          console.log('watermark_img', res.tempFilePath);
          resolve(res.tempFilePath);
        },
        fail(res) {
          reject(false);
        },
      })
    };
  });
}
module.exports = {
  login,
  watermark
}