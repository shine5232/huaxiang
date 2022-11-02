var app = getApp();
var Base64 = require('js-base64');
var Crypto = require('crypto-js');
var Configuration = {
  AccessKeyId: 'R3AHXQJX7FNJ37AZ22BV', //AK
  SecretKey: 'hwgZ2rFXTwdHqHJJNKGJ37ZwfCLInWD0iWkDv80P', //SK
  EndPoint: 'https://hx-zhangting.obs.cn-north-1.myhuaweicloud.com',
}
var QQMapWX = require('./qqmap-wx-jssdk.min.js');
var qqmapsdk = new QQMapWX({
  key: 'BLCBZ-C4QOU-UORVG-22AYH-D55H2-55BIP'
});
import {
  md5
} from "./md5"
import {
  base64src
} from "./base64src"
import {
  baseUrl,
  baseUrlP
} from "./baseUrl"
import {
  login,
  watermark
} from './common'
import {
  formatTime,
  formatDate,
  formatDates,
  formatISOTime
} from "./formatDate"
//sign签名
function sign(param, timestamp) {
  let encryptionkey = 'hxlx_agent';
  return md5(JSON.stringify(param) + encryptionkey + timestamp);
}
//画布生成图片
function CanvasToImage(option) {
  let defaultOption = {
    canvas: '',
    ctx: '',
    canvasId: '',
    imgsrc: '',
    destWidth: '',
    destHeight: '',
    rotate: 0,
    fileType: 'jpg'
  }
  let options = Object.assign({}, defaultOption, option);
  console.log('src', options);
  return new Promise(function (resolve, reject) {
    var img = options.canvas.createImage();
    img.src = options.imgsrc;
    img.onload = function () {
      // 2.1 设置canvas宽高，旋转90° ，宽高互换
      if (options.rotate) {
        options.canvas.width = this.height;
        options.canvas.height = this.width;
        console.log('this.height', this.height);
        console.log('this.width', this.width);
        console.log('options.canvas.height', options.canvas.height);
        console.log('options.canvas.width', options.canvas.width);
        // 2.2 画布中心点(也是起始点)平移至中心(0,0)->(x,y)
        options.ctx.translate(options.canvas.width / 2, options.canvas.height / 2);
        // 2.3 画布旋转90°
        options.ctx.rotate(options.rotate * Math.PI / 180);
        // 2.4 绘制图像 图像起始点需偏移负宽高
        options.ctx.fillStyle = "#FFFFFF";
        options.ctx.fillRect(-options.canvas.height / 2, -options.canvas.width / 2, options.canvas.height, options.canvas.width);
        //options.ctx.restore();
        options.ctx.drawImage(img, -this.width / 2, -this.height / 2);
        console.log('ctx', options.ctx);
      } else {
        options.canvas.width = this.width;
        options.canvas.height = this.height;
        options.ctx.fillStyle = "#FFFFFF";
        options.ctx.fillRect(0, 0, options.canvas.width, options.canvas.height);
        //options.ctx.restore();
        options.ctx.drawImage(img, 0, 0);
      }
      console.log('opt', options);
      wx.canvasToTempFilePath({
        canvasId: options.canvasId,
        fileType: options.fileType,
        canvas: options.canvas,
        destWidth: options.canvas.width,
        destHeight: options.canvas.height,
        quality: 1, //图片质量
        success(res) {
          console.log('im', res.tempFilePath);
          resolve(res.tempFilePath);
        },
        fail(res) {
          console.log('fas', res);
          reject(res);
        }
      })
    };
  })
}

function getPolicyEncode(policy) {
  // 传入表单上传的policy字段，对policy进行Base64编码
  const encodedPolicy = Base64.encode(JSON.stringify(policy));
  return encodedPolicy;
}

function getSignature(policyEncoded, SecretKey) {
  // 利用SK对Base64编码后的policy结果进行HMAC-SHA1签名计算
  const bytes = Crypto.HmacSHA1(policyEncoded, SecretKey);
  // 对计算结果进行Base64编码，得到最终的签名信息
  const signature = Crypto.enc.Base64.stringify(bytes);
  return signature;
}

function IdentityCodeValid(code) {
  const city = {
    11: "北京",
    12: "天津",
    13: "河北",
    14: "山西",
    15: "内蒙古",
    21: "辽宁",
    22: "吉林",
    23: "黑龙江",
    31: "上海",
    32: "江苏",
    33: "浙江",
    34: "安徽",
    35: "福建",
    36: "江西",
    37: "山东",
    41: "河南",
    42: "湖北",
    43: "湖南",
    44: "广东",
    45: "广西",
    46: "海南",
    50: "重庆",
    51: "四川",
    52: "贵州",
    53: "云南",
    54: "西藏",
    61: "陕西",
    62: "甘肃",
    63: "青海",
    64: "宁夏",
    65: "新疆",
    71: "台湾",
    81: "香港",
    82: "澳门",
    91: "国外"
  };
  let pass = true;
  let codeS = code.toUpperCase();
  if (!codeS || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(codeS)) {
    pass = false;
  } else if (!city[codeS.substr(0, 2)]) {
    pass = false;
  } else {
    //18位身份证需要验证最后一位校验位
    if (codeS.length == 18) {
      codeS = codeS.split('');
      //∑(ai×Wi)(mod 11)
      //加权因子
      var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      //校验位
      var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      var ai = 0;
      var wi = 0;
      for (var i = 0; i < 17; i++) {
        ai = codeS[i];
        wi = factor[i];
        sum += ai * wi;
      }
      var last = parity[sum % 11];
      if (parity[sum % 11] != codeS[17]) {
        pass = false;
      }
    }
  }
  return pass;
}
// 将秒转换为分
function secondToMinSec(s) {
  //计算分钟 将秒数除以60，然后下舍入，既得到分钟数
  var h;
  h = Math.floor(s / 60);
  //计算秒 取得秒%60的余数，既得到秒数
  s = s % 60;
  //将变量转换为字符串
  h += '';
  s += '';
  //如果只有一位数，前面增加一个0
  h = (h.length == 1) ? '0' + h : h;
  s = (s.length == 1) ? '0' + s : s;
  return h + ':' + s;
}
//获取设备信息
function getSysInfo() {
  return new Promise(function (resolve, reject) {
    wx.getSystemInfo({
      success(res) {
        wx.setStorageSync('deviceType', res.model);
        wx.setStorageSync('osVersion', res.system);
        resolve(res);
      },
      fail(error) {
        console.log(error);
        reject(false);
      }
    })
  });
}
//获取网络信息
function getNetwork() {
  return new Promise(function (resolve, reject) {
    wx.getNetworkType({
      success(res) {
        app.globalData.netWorkType = res.networkType;
        wx.setStorageSync('netWorkType', res.networkType);
        resolve(res);
      },
      fail(error) {
        reject(false);
      }
    })
  });
}
//监听网络状态
function netWorkStatus() {
  return new Promise(function (resolve, reject) {
    if (app.globalData.netWorkStatus) {
      resolve(true);
    } else {
      reject(false);
    }
  })
}
//地理位置授权
function getLocationAuth() {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '温馨提示',
            content: '系统检查到未开启GPS定位服务，请打开定位',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting["scope.userLocation"] == true) {
                      resolve(true);
                    } else {
                      reject(false);
                    }
                  }
                })
              }
              if(res.cancel){
                wx.showModal({
                  title: '温馨提示',
                  content: '为了给您提供更好的服务，请打开定位',
                  showCancel: false,
                  success: function (res) {
                    wx.openSetting({
                      success: function (res) {
                        if (res.authSetting["scope.userLocation"] == true) {
                          //resolve(true);
                        } else {
                          //reject(false);
                        }
                      }
                    })
                  }
                });
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          resolve(true);
        } else {
          resolve(true);
        }
      }
    })
  });
}
//获取定位信息
function getLocation() {
  wx.removeStorageSync('location');
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success (res) {
        console.log('res',res);
        reverseGeocoder(res).then((res)=>{
          resolve(res);
        }).catch((err)=>{
          reject(true);
        });
      },
      fail(err){
        reject(true);
      }
     })
    /* reverseGeocoder(res).then((ret)=>{
      console.log('ret',ret);
      resolve(ret);
    }).catch((err)=>{
      reject(err);
    }); */
    /* const locationFun = (res) => {
      reverseGeocoder(res).then((ret)=>{
        wx.offLocationChange(locationFun);
        resolve(ret);
      }).catch((err)=>{
        reject(err);
      });
    }
    wx.startLocationUpdate({
      success: (res) => {
        wx.onLocationChange(locationFun);
      },
      fail: (err) => {
       reject(false);
      }
    }) */
  });
}
//地理位置解析
function reverseGeocoder(location) {
  return new Promise((resolve,reject)=>{
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      success: function (res) {
        wx.setStorageSync('location', res.result);
        /* wx.showModal({
          title: '温馨提示',
          content: res.result.address,
          showCancel: false,
        }); */
        resolve(res);
      },
      fail(e) {
        reject(true);
      }
    })  
  });
}
 //获取录音录像权限
function getAuthVioce() {
  return new Promise(function (resolve, reject) {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.camera']) { //获取摄像头权限
          wx.authorize({
            scope: 'scope.camera',
            success() {
              resolve(true);
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '尚未进行授权，部分功能将无法使用',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (res) => {
                        if (!res.authSetting['scope.camera']) {
                          wx.authorize({
                            scope: 'scope.camera',
                            success() {
                              resolve(true);
                            },
                            fail() {
                              resolve(false);
                            }
                          })
                        } else {
                          resolve(true);
                        }
                      },
                      fail: function () {
                        reject(false);
                      }
                    })
                  } else if (res.cancel) {
                    reject(false);
                  }
                }
              })
            }
          })
        } else {
          resolve(true);
        }
        if (!res.authSetting['scope.record']) { //获取录音机权限
          wx.authorize({
            scope: 'scope.record',
            success() {
              resolve(true);
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '尚未进行授权，部分功能将无法使用',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (res) => {
                        if (!res.authSetting['scope.record']) {
                          wx.authorize({
                            scope: 'scope.record',
                            success() {
                              resolve(true);
                            },
                            fail() {
                              resolve(false);
                            }
                          })
                        } else {
                          resolve(true);
                        }
                      },
                      fail: function () {
                        reject(false);
                      }
                    })
                  } else if (res.cancel) {
                    reject(false);
                  }
                }
              })
            }
          })
        } else {
          resolve(true);
        }
      }
    })
  });
}
module.exports = {
  formatTime,
  formatDate,
  formatDates,
  formatISOTime,
  baseUrl,
  baseUrlP,
  login,
  watermark,
  sign,
  CanvasToImage,
  getPolicyEncode,
  getSignature,
  Configuration,
  IdentityCodeValid,
  secondToMinSec,
  getSysInfo,
  getNetwork,
  netWorkStatus,
  base64src,
  getLocationAuth,
  getLocation,
  qqmapsdk,
  getAuthVioce
}