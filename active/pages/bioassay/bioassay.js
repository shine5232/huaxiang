import Toast from '../../../miniprogram_npm/@vant/weapp/toast/toast'
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog'
import {
  baseUrl,
  base64src,
  watermark
} from '../../../utils/util'
import {
  FILE,
  POST
} from '../../../utils/promise'
var app = getApp();

Page({
  data: {
    btntitle: '准备好了，开始录制',
    start: true,
    disabled: false,
    num: [],
    timer: 6,
    type: 1,
    active: 1,
    ctx: '',
    ybcode: '',
    city: '',
    timeLoop: '',
    timeLoopT: '',
    showInfo: true,
    isBioass: true,
    title: '下一步，告知签署',
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
    cameraHeight: 100,
    cameraWidth: 100,
    canvas1: null,
    ctx1: null,
  },
  onLoad() {
    const that = this;
    const ctx = wx.createCameraContext({
      "device-position": "front"
    });
    that.setData({
      ctx: ctx,
      isBioass: !app.globalData.isBioass,
      title: app.globalData.isBioass ? '下一步' : '下一步，告知签署',
    });
  },
  onReady() {
    const that = this;
    const query = wx.createSelectorQuery();
    query.select('#myCanvas1').fields({
      node: true,
      size: true
    }).exec((res) => {
      const canvas1 = res[0].node;
      const ctx1 = canvas1.getContext('2d');
      that.setData({
        canvas1,
        ctx1
      });
    });
  },
  //判断字符串过期
  stringUsed() {
    const that = this;
    let timestamp = wx.getStorageSync('timestamp');
    let timenow = Date.parse(new Date());
    if (timestamp == null || timestamp == '') { //第一次进入
      that.getRandString();
    } else {
      if (timestamp > timenow) { //没过期
        let randstring = wx.getStorageSync('randstring');
        let code = String(randstring).split('');
        if (that.data.timeLoopT) {
          clearInterval(that.data.timeLoopT);
        }
        let timers = timestamp - timenow
        setTimeout(function () {
          that.getRandString();
        }, timers);
        that.setData({
          num: code
        });
      } else { //已过期
        that.getRandString();
      }
    }
  },
  //请求随机字符串
  getRandString() {
    const that = this;
    let url = baseUrl + '/api/getFacelivenessSessionCode';
    let parms = {
      type: 0,
      minCodeLength: 4,
      maxCodeLength: 4,
      svcNumber: app.globalData.mobile
    }
    POST(url, parms).then(function (res, jet) {
      if (res.code == 200) {
        let timestamp = Date.parse(new Date());
        let expiration = timestamp + 270000;
        wx.setStorageSync('timestamp', expiration)
        wx.setStorageSync('randstring', res.datas.code)
        wx.setStorageSync('session_id', res.datas.session_id)
        let code = String(res.datas.code).split('');
        if (that.data.timeLoopT) {
          clearInterval(that.data.timeLoopT);
        }
        let timeLoopT = setInterval(function () {
          that.getRandString();
        }, 270000);
        that.setData({
          num: code,
          timeLoopT: timeLoopT
        });
      } else {
        Toast.fail(res.msg);
      }
    });
  },
  //页面展示
  onShow() {
    const that = this;
    if (!app.globalData.isBioass) {
      that.getAuthVioce().then((data) => {
        that.stringUsed();
      }).catch((error) => {});
    }
  },
  //获取录音录像权限
  getAuthVioce() {
    return new Promise(function (resolve, reject) {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.camera']) { //获取摄像头权限
            wx.authorize({
              scope: 'scope.camera',
              success() {
                //console.log('授权成功')
                resolve(true);
              },
              fail() {
                wx.showModal({
                  title: '提示',
                  content: '尚未进行授权，部分功能将无法使用',
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      //console.log('用户点击确定')
                      wx.openSetting({ //这里的方法是调到一个添加权限的页面，可以自己尝试
                        success: (res) => {
                          if (!res.authSetting['scope.camera']) {
                            wx.authorize({
                              scope: 'scope.camera',
                              success() {
                                //console.log('授权成功')
                                resolve(true);
                              },
                              fail() {
                                //console.log('用户点击取消')
                                resolve(false);
                              }
                            })
                          } else {
                            resolve(true);
                          }
                        },
                        fail: function () {
                          //console.log("授权设置录音失败");
                          reject(false);
                        }
                      })
                    } else if (res.cancel) {
                      //console.log('用户点击取消1')
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
                //console.log('授权成功')
                resolve(true);
              },
              fail() {
                wx.showModal({
                  title: '提示',
                  content: '尚未进行授权，部分功能将无法使用',
                  showCancel: false,
                  success(res) {
                    if (res.confirm) {
                      //console.log('用户点击确定')
                      wx.openSetting({ //这里的方法是调到一个添加权限的页面，可以自己尝试
                        success: (res) => {
                          if (!res.authSetting['scope.record']) {
                            wx.authorize({
                              scope: 'scope.record',
                              success() {
                                //console.log('授权成功')
                                resolve(true);
                              },
                              fail() {
                                //console.log('用户点击取消')
                                resolve(false);
                              }
                            })
                          } else {
                            resolve(true);
                          }
                        },
                        fail: function () {
                          //console.log("授权设置录音失败");
                          reject(false);
                        }
                      })
                    } else if (res.cancel) {
                      //console.log('用户点击取消1')
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
  },
  //开始录制
  takePhotoStart() {
    const that = this;
    that.data.ctx.startRecord({
      timeoutCallback: function (res) {
        //console.log(res);
      },
      success: function (res) {
        //console.log(res);
      }
    });
    let t = 6;
    let timeLoop = setInterval(function () {
      t--;
      that.setData({
        timer: t
      });
      if (t == 0) {
        clearInterval(timeLoop);
        that.takePhotoEnd();
      }
    }, 1000);
    that.setData({
      timeLoop: timeLoop
    })
    that.setData({
      btntitle: '结束录制，上传检测',
      start: false,
    });
  },
  //结束录制
  takePhotoEnd() {
    const that = this;
    if (that.data.timeLoop) {
      clearInterval(that.data.timeLoop);
    }
    that.setData({
      disabled: true,
    });
    wx.showLoading({
      title: '人脸检测中...',
      mask: true,
    });
    that.data.ctx.stopRecord({
      compressed: true,
      success: function (res) {
        let url = baseUrl + '/api/getFacelivenessVerify';
        let fileName = 'clientFile';
        let params = {
          sessionId: wx.getStorageSync('session_id'),
          typeIdentify: 'voice',
          svcNumber: wx.getStorageSync('mobile')
        };
        FILE(url, fileName, res.tempVideoPath, params, false).then(function (res, jet) {
          if (res.code == 200) {
            let datas = res.datas;
            let piclivebest = "data:image/jpeg;base64," + datas.bestImage.pic;
            let opIds = ["data:image/jpeg;base64," + datas.picList[0].pic, "data:image/jpeg;base64," + datas.picList[1].pic];
            base64src(piclivebest).then((a) => {
              return watermark(a, that);
            }).then((b) => {
              console.log('res_to_img', b);
              let name = new Date().getTime() + '_' + app.globalData.mobile;
              console.log('name', name);
              return that.upLoadImg('clientFile', name, b, 3);
            }).then((c) => {
              app.globalData.piclivebest = c.datas.picnamehand;
              opIds.forEach(function (item, index) {
                base64src(item).then((d) => {
                  console.log('d' + index, d);
                  return watermark(d, that);
                }).then((e) => {
                  console.log('res_to_img' + index, e);
                  let name = new Date().getTime() + '_' + app.globalData.mobile;
                  return that.upLoadImg('clientFile', name, e, 3);
                }).then((f) => {
                  app.globalData.opIds[index] = f.datas.picnamehand;
                  if (index === 1) {
                    that.faceComparisonSas();
                  }
                }).catch((error) => {
                  that.restartVoice(error);
                });
              });
            }).catch((error) => {
              that.restartVoice(error);
            });
          } else {
            that.restartVoice(res.msg);
          }
        }).catch((error) => {
          console.log(error);
          that.restartVoice(error.msg);
        });
      },
      fail: function (e) {
        that.restartVoice();
        console.log('录制失败', e);
      }
    });
  },
  //重新录制
  restartVoice(msg = "检测失败，") {
    const that = this;
    wx.hideLoading();
    let failNum = wx.getStorageSync('failNum')?wx.getStorageSync('failNum'):0;
    failNum = parseInt(failNum);
    if(failNum === 1){
      Dialog.alert({
        title: '温馨提示',
        message: '检验失败，请退出重试',
        confirmButtonText: '退出重试',
      }).then(() => {
        wx.removeStorageSync('timestamp');
        wx.removeStorageSync('failNum');
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }).catch(()=>{});
    }else{
      that.failed(msg,failNum);
    }
  },
  //失败弹窗
  failed(msg,failNum){
    const that = this;
    Dialog.confirm({
      title: '温馨提示',
      message: msg + ' 是否重新录制？',
      cancelButtonText: '返回首页',
      confirmButtonText: '重新录制',
    }).then(() => {
      failNum = failNum + 1;
      wx.setStorageSync('failNum',failNum);
      clearInterval(that.data.timeLoop);
      wx.removeStorageSync('timestamp');
      //wx.navigateBack();
      that.getRandString();
      that.setData({
        timer: 6,
        start: true,
        disabled:false,
        btntitle: '准备好了，开始录制',
      });
    }).catch(() => {
      wx.removeStorageSync('timestamp');
      wx.reLaunch({
        url: '/pages/index/index'
      })
    });
  },
  //图片上传
  upLoadImg(fileName, name, clientFile, type) {
    const url = baseUrl + '/api/uploadFileSas';
    //const url = 'https://laravel.harus.icu/api/upload/vioceFile';
    let param = {
      fileName: name,
      fechType: 1,
      type: type
    };
    return new Promise(function (resolve, reject) {
      FILE(url, fileName, clientFile, param, false)
        .then((res) => {
          if (res.code == 200) {
            resolve(res);
          } else {
            reject('上传失败');
          }
        })
        .catch((error) => {
          reject('上传失败');
        });
    });
  },
  //人照比对
  faceComparisonSas() {
    const that = this;
    let url = baseUrl + '/api/faceComparisonSasNew';
    let parms = {
      picnamez: wx.getStorageSync('picnamez'),
      piclivebest: app.globalData.piclivebest,
      orderId: app.globalData.orderId
    }
    console.log('url', url);
    console.log('parms', parms);
    POST(url, parms).then(function (res, jet) {
      if (res.code == 200) {
        that.faceVerify();
      } else {
        that.restartVoice(res.msg);
      }
    }).catch((e) => {
      that.restartVoice();
    });
  },
  //在线活体
  faceVerify() {
    const that = this;
    let url = baseUrl + '/api/faceVerify';
    let parms = {
      opIds: app.globalData.opIds,
      svcNumber: app.globalData.mobile
    }
    console.log('url', url);
    console.log('parms', parms);
    POST(url, parms).then(function (res, jet) {
      if (res.code == 200) {
        wx.removeStorageSync('timestamp');
        wx.removeStorageSync('randstring');
        wx.removeStorageSync('session_id');
        wx.reLaunch({
          url: '/active/pages/notes/notes'
        })
      } else {
        wx.removeStorageSync('timestamp');
        wx.removeStorageSync('randstring');
        wx.removeStorageSync('session_id');
        that.restartVoice(res.msg);
      }
    }).catch((e) => {
      that.restartVoice();
    });
  },
  //页面销毁
  onUnload() {
    const that = this;
    clearInterval(that.data.timeLoopT);
    clearInterval(that.data.timeLoop);
  },
  nextStep() {
    wx.reLaunch({
      url: '/active/pages/notes/notes'
    })
  },
})