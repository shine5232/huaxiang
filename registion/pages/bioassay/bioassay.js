import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog'
import {
  baseUrl,
  baseUrlP,
  base64src,
  watermark,
  getAuthVioce
} from '../../../utils/util'
import {
  POST,
  FILE
} from '../../../utils/promise'
var app = getApp();

Page({
  data: {
    btntitle: '准备好了，开始录制',
    start: true,
    num: [],
    timer: 6,
    type: 3,
    active: 2,
    ctx: '',
    ybcode: '',
    city: '',
    timeLoop: '',
    timeLoopT: '',
    showInfo: true,
    isBioass: true,
    title: '下一步，告知签署',
    disabled: false,
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
      svcNumber: wx.getStorageSync('mobile')
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
        wx.showToast({
          icon:'none',
          mask:true,
          title:res.msg
        });
      }
    });
  },
  onShow() {
    const that = this;
    if (!app.globalData.isBioass) {
      getAuthVioce().then((data) => {
        that.stringUsed();
      }).catch((error) => {});
    }
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
        let mobile = wx.getStorageSync('mobile');
        let params = {
          sessionId: wx.getStorageSync('session_id'),
          typeIdentify: 'voice',
          svcNumber: mobile
        };
        console.log('视频path', res.tempVideoPath);
        FILE(url, fileName, res.tempVideoPath, params, false).then(function (res, jet) {
          console.log('getFacelivenessVerify', res);
          if (res.code == 200) {
            let datas = res.datas;
            let piclivebest = "data:image/jpeg;base64," + datas.bestImage.pic;
            let opIds = ["data:image/jpeg;base64," + datas.picList[0].pic, "data:image/jpeg;base64," + datas.picList[1].pic];
            base64src(piclivebest).then((a) => {
              return watermark(a, that);
            }).then((b)=>{
              console.log('res_to_img', b);
              let name = new Date().getTime() + '_' + app.globalData.mobile;
              console.log('name', name);
              return that.upLoadImg('clientFile', name, b, 3);
            }).then((c) => {
              return that.opIdsFun(c.datas.picnamehand,0,0);
            }).then(()=>{
              return base64src(opIds[0]);
            }).then((d)=>{
              console.log('d' + 0, d);
              return watermark(d, that);
            }).then((e)=>{
              console.log('res_to_img' + 0, e);
              let name = new Date().getTime() + '_0_' + app.globalData.mobile;
              return that.upLoadImg('clientFile', name, e, 3);
            }).then((f)=>{
              return that.opIdsFun(f.datas.picnamehand,0,1);
            }).then(()=>{
              return base64src(opIds[1]);
            }).then((g)=>{
              console.log('g' + 1, g);
              return watermark(g, that);
            }).then((h)=>{
              console.log('res_to_img' + 1, h);
              let name = new Date().getTime() + '_1_' + app.globalData.mobile;
              return that.upLoadImg('clientFile', name, h, 3);
            }).then((t)=>{
              return that.opIdsFun(t.datas.picnamehand,1,1);
            }).then(()=>{
              return that.faceComparisonSas();
            }).then(()=>{
              return that.faceVerify();
            }).then(()=>{
              return that.submitOrderRealName();
            }).then(()=>{
              return that.recordLoginInfo();
            }).then(()=>{
              wx.hideLoading();
              wx.reLaunch({
                url: '/pages/complete/complete?title=实名补登记&from=reg_complete&note=实名补登记提交成功，系统正在审核，请您耐心等候'
              });
            }).catch((error) => {
              wx.hideLoading();
              that.restartVoice(error);
            });
          } else {
            that.restartVoice('视频上传失败');
          }
        }).catch((error) => {
          console.log('视频错误',error);
          that.restartVoice('视频上传调用失败');
        });
      },
      fail: function (e) {
        that.restartVoice('录制失败');
        console.log('视频录制失败', e);
      }
    });
  },
  opIdsFun(f,index,key){
    return new Promise(function (resolve, reject) {
      if(key === 0){
        app.globalData.piclivebest = f;
      }else{
        app.globalData.opIds[index] = f;
      }
      resolve();
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
    let parms = {
      fileName: name,
      fechType: 1,
      type: type
    };
    console.log('uploadFileSas', parms);
    return new Promise(function (resolve, reject) {
      FILE(url, fileName, clientFile, parms, false)
        .then((res) => {
          if (res.code == 200) {
            resolve(res);
          } else {
            reject('图片上传失败');
          }
        })
        .catch((error) => {
          reject('请求上传失败');
        });
    });
  },
  //人照比对
  faceComparisonSas() {
    let url = baseUrl + '/api/faceComparisonSas';
    let idcardA = wx.getStorageSync('idcardA');
    let parms = {
      picnamez: idcardA.picnamez,
      picnamehand: app.globalData.piclivebest
    }
    console.log('faceComparisonSas', parms);
    return new Promise(function(resolve,reject){
      POST(url, parms).then(function (res, jet) {
        if (res.code == 200) {
          resolve();
        } else {
          reject(res.msg);
        }
      }).catch((e) => {
        reject('请求失败');
      });
    });
  },
  //在线活体
  faceVerify() {
    let url = baseUrl + '/api/faceVerify';
    let parms = {
      opIds: app.globalData.opIds,
      svcNumber: wx.getStorageSync('mobile')
    }
    console.log('faceVerify', parms);
    return new Promise(function(resolve,reject){
      POST(url, parms).then(function (res, jet) {
        if (res.code == 200) {
          wx.removeStorageSync('timestamp');
          wx.removeStorageSync('randstring');
          wx.removeStorageSync('session_id');
          wx.removeStorageSync('failNum');
          resolve();
        } else {
          wx.removeStorageSync('timestamp');
          wx.removeStorageSync('randstring');
          wx.removeStorageSync('session_id');
          reject(res.msg);
        }
      }).catch((e) => {
        reject('请求失败');
      });
    });
  },
  //提交实名订单
  submitOrderRealName() {
    let url = baseUrl + '/api/user/submitOrderRealName';
    let idcardA = wx.getStorageSync('idcardA');
    let idcardB = wx.getStorageSync('idcardB');
    let mobile = wx.getStorageSync('mobile');
    let videoCheck = wx.getStorageSync('videoCheck');
    let fileName = wx.getStorageSync('fileName');
    let picAttachA = wx.getStorageSync('handId');
    let picAttachB = wx.getStorageSync('simId');
    let type = wx.getStorageSync('cardType')?wx.getStorageSync('cardType'):'';
    let parms = {
      fechType: '1',
      svcNumber: mobile,
      picnamez: idcardA.picnamez,
      picnamef: idcardB.picnamef,
      picnamehand: app.globalData.piclivebest,
      custcertno: idcardA.cardInfo.公民身份号码.words,
      custname: idcardA.cardInfo.姓名.words,
      gender: idcardA.cardInfo.性别.words,
      nation: idcardA.cardInfo.民族.words,
      birthdayDate: idcardA.cardInfo.出生.words,
      address: idcardA.cardInfo.住址.words,
      issuingauthority: idcardB.cardInfo.签发机关.words,
      certvalidDate: idcardB.cardInfo.签发日期.words,
      certexpDate: idcardB.cardInfo.失效日期.words == '长期' ? '20991231' : idcardB.cardInfo.失效日期.words,
      picAttachA: picAttachA ? picAttachA : '',
      picAttachB: picAttachB ? picAttachB : '',
      picAttachC: videoCheck == '1' ? fileName : '',
      type:type
    }
    console.log('submitOrderRealName', parms);
    return new Promise(function(resolve,reject){
      POST(url, parms).then(function (res, jet) {
        if (res.code == 200) {
          resolve();
        } else {
          reject(res.msg);
        }
      }).catch(()=>{
        reject('请求失败');
      });
    });
  },
  //记录登录日志
  recordLoginInfo() {
    let url = baseUrlP + '/app/login/recordLoginInfo';
    let location = wx.getStorageSync('location');
    let mobile = wx.getStorageSync('mobile');
    let deviceId = wx.getStorageSync('deviceId');
    let deviceType = wx.getStorageSync('deviceType');
    let osVersion = wx.getStorageSync('osVersion');
    let netWorkType = wx.getStorageSync('netWorkType');
    let parms = {
      fromType: 'RealName',
      osType: 'XCX',
      serviceNum: mobile,
      longitude: location.location.lng,
      latitude: location.location.lat,
      areaText: location.address,
      countryCode: location.ad_info.nation_code,
      adCode: location.ad_info.adcode,
      cityCode: location.ad_info.city_code,
      deviceId: deviceId,
      deviceType: deviceType,
      osVersion: osVersion,
      netWorkType: netWorkType
    }
    console.log('recordLoginInfo', parms);
    return new Promise(function (resolve, reject) {
      POST(url, parms).then(function (res, jet) {
        if (res.code == 200) {
          resolve();
        } else {
          reject(res.msg);
        }
      }).catch(() => {
        reject('请求失败');
      });
    });
  },
  //页面销毁
  onUnload() {
    const that = this;
    clearInterval(that.data.timeLoopT);
    clearInterval(that.data.timeLoop);
  },
  //点击下一步
  nextStep() {
    wx.reLaunch({
      url: '/registion/pages/notes/notes'
    })
  },
})