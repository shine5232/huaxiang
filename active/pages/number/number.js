import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog'
import {
  baseUrl,
  baseUrlP,
  getSysInfo,
  getNetwork
} from '../../../utils/util'
import {
  POST
} from '../../../utils/promise'
var app = getApp();
Page({
  data: {
    type: 1,
    active: 0,
    mobile: '',
    iccid: '',
    yzm: '',
    numberFee: '',
    minFee: '',
    proto: '',
    productName: '',
    numberOperType: '',
    productId: '',
    orderId: '',
    orderStatus: '',
    checked: false,
    mobileMessage: '',
    iccidMessage: '',
    status: 0,
    hidden: true,
    overlay: false,
    pops: false,
    message: '',
    submit: false,
    productDesc: "",
    btnTitle: '提交确认',
    next: 1,
    areaLim: '',
    showDialog: true,
    errorCode: 200,
    showReservationDialog: false,
    showMsg: '',
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
  },
  //页面加载完成
  onLoad() {
    const that = this;
    that.code = that.selectComponent("#code");
    getSysInfo().then((res) => {
      return getNetwork();
    }).then((res) => {}).catch((e) => {});
  },
  //监听小程序初始化完成
  onShow() {
    const that = this;
    /* wx.removeStorageSync('randstring');
    wx.removeStorageSync('idcardA');
    wx.removeStorageSync('idcardB');
    wx.removeStorageSync('handCard');
    wx.removeStorageSync('mobile');
    wx.removeStorageSync('videoCheck');
    wx.removeStorageSync('fileName');
    wx.removeStorageSync('handId');
    wx.removeStorageSync('simId');
    wx.removeStorageSync('cardType');
    wx.removeStorageSync('certName');
    wx.removeStorageSync('idcard');
    wx.removeStorageSync('picnamez');
    wx.removeStorageSync('numberOperType'); */
    that.getCode();
    that.setData({
      type: 1,
      mobile: '',
      iccid: '',
      yzm: '',
      numberFee: '',
      minFee: '',
      proto: '',
      productName: '',
      numberOperType: '',
      orderId: '',
      orderStatus: '',
      checked: true,
      status: 0,
      hidden: true,
      overlay: false,
      pops: false,
      message: '',
      submit: false,
      productDesc: "",
      btnTitle: '提交确认',
      next: 1,
      productId: '',
      errorCode: 200,
    });
  },
  //关闭入场弹窗提示
  confirmDialog() {
    const that = this;
    that.setData({
      showDialog: false
    });
  },
  //关闭预约登记提示
  confirmReservationDialog() {
    const that = this;
    that.setData({
      showReservationDialog: false
    });
    wx.reLaunch({
      url: '/reservation/pages/number/number'
    });
  },
  //提交验证手机号
  verifyMobile() {
    const that = this;
    if (that.data.mobile == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入手机号'
      });
      return false;
    } else {
      if (!/^1(3|4|5|6|7|8)\d{9}$/.test(that.data.mobile)) {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: '请输入正确的手机号'
        });
        return false;
      }
    }
    return true;
  },
  //提交验证ICCID
  verifyIccid() {
    const that = this;
    const iccid = that.data.iccid;
    if (iccid == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入ICCID'
      });
      return false;
    } else {
      if (!/^[A-Z|0-9]{5}$/.test(iccid)) {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: '请输入正确的ICCID'
        });
        return false;
      }
    }
    return true;
  },
  //提交验证验证码
  verifyYzm() {
    const that = this;
    const yzm = that.data.yzm;
    if (yzm == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入验证码'
      });
      return false;
    } else {
      let code = wx.getStorageSync('code');
      if (yzm.toLowerCase() != code) {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: '请输入正确的验证码'
        });
        return false;
      } else {
        return true;
      }
    }
  },
  //提交验证接口返回的ICCID
  verifyIccidRet() {
    let that = this;
    if (app.globalData.iccid == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '该号码暂不支持激活'
      });
      return false;
    }
    return true;
  },
  //提交验证协议是否勾选
  verifyAgreement() {
    const that = this;
    if (!that.data.checked) {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请同意并勾选协议'
      });
      return false;
    }
    return true;
  },
  //提交验证号码状态
  verifySubmit() {
    const that = this;
    if (that.data.errorCode == 608) {
      that.setData({
        showReservationDialog: true,
      });
      return false;
    } else if (that.data.errorCode == 200) {
      if (that.data.numberOperType == '2') {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: "该号码不支持本渠道激活，如有疑问请联系售卡人员",
          duration: 2000
        });
        return false;
      }
    }
    if (!that.data.submit) {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: that.data.message
      });
      return false;
    }
    return true;
  },
  //监听手机号输入
  onChangeMobile(e) {
    let that = this;
    const mobile = e.detail;
    const iccid = that.data.iccid;
    that.setData({
      mobile: mobile
    });
    if (mobile) {
      if (/^1(3|4|5|6|7|8)\d{9}$/.test(mobile)) {
        that.activeNumber(mobile, iccid);
      }
    }
  },
  //监听ICCID输入
  onChangeIccid(e) {
    let that = this;
    const iccid = e.detail;
    const mobile = that.data.mobile;
    that.setData({
      iccid: iccid,
    });
    if (iccid) {
      if (/^[A-Z|0-9]{5}$/.test(iccid)) {
        that.activeNumber(mobile, iccid);
      }
    }
  },
  //监听验证码输入
  onChangeYzm(e) {
    let that = this;
    const yzm = e.detail;
    that.setData({
      yzm: yzm,
    });
  },
  //监听协议勾选
  onChange(e) {
    this.setData({
      checked: e.detail
    });
  },
  //调用号卡查询接口
  activeNumber(mobile, iccid) {
    const that = this;
    let url = baseUrl + '/api/user/getSvcNumAndCardInfo';
    let parms = {
      cardNumber: iccid,
      svcNumber: mobile
    }
    POST(url, parms).then(function (res, jet) {
      that.code.creatCodeImg(4);
      that.setData({
        errorCode: res.code
      });
      if (res.code == 200) {
        let datas = res.datas;
        if (datas.numberOperType == '2') {
          wx.showToast({
            icon: 'none',
            mask: true,
            title: "该号码不支持本渠道激活，如有疑问请联系售卡人员",
            duration: 2000
          });
          return false;
        }
        wx.setStorageSync('picnamez', datas.picnamez);
        wx.setStorageSync('mobile', mobile);
        wx.setStorageSync('numberOperType', datas.numberOperType);
        app.globalData.iccid = datas.iccid;
        app.globalData.mobile = that.data.mobile;
        app.globalData.chnlCode = datas.chnlCode;
        app.globalData.productInfo = {
          productName: datas.productName,
          minFee: datas.minFee / 100,
          numberFee: datas.numberFee / 100
        }
        that.setData({
          numberFee: datas.numberFee / 100,
          minFee: datas.minFee / 100,
          proto: datas.proto,
          productName: datas.productName,
          productDesc: datas.productDesc,
          orderId: datas.orderId,
          productId: datas.productId,
          numberOperType: datas.numberOperType,
          hidden: false,
          submit: true,
          btnTitle: '下一步，身份识别',
          next: 2,
        });
        if (datas.numberOperType == '2') {
          wx.showToast({
            icon: 'none',
            mask: true,
            title: "该号码不支持本渠道激活，如有疑问请联系售卡人员",
            duration: 2000
          });
          return false;
        }
        app.globalData.steps = datas.numberFee > 0 ? 2 : 1;
        if (datas.orderId) { //存在预约订单
          that.getOrderInfo(datas.orderId);
        }
        if (datas.numberOperType == '0') {
          that.getAreaLimt();
        }
      } else {
        if (res.code == 608) {
          that.setData({
            showReservationDialog: true,
            showMsg: res.msg,
          });
        } else {
          /* wx.showToast({
            icon: 'none',
            mask: true,
            title: res.msg,
            duration: 2000
          }); */
        }
        that.setData({
          hidden: true,
          numberFee: '',
          minFee: '',
          proto: '',
          productName: '',
          productDesc: '',
          orderId: '',
          productId: '',
          submit: false,
          message: res.msg,
          numberOperType: '',
        });
      }
    });
  },
  //查询预约订单详情
  getOrderInfo(orderId) {
    const that = this;
    let url = baseUrl + '/api/order/getOrderInfo';
    let parms = {
      orderId: orderId
    }
    POST(url, parms).then(function (res, jet) {
      if (res.code == 200) {
        let datas = res.datas;
        app.globalData.orderId = orderId;
        that.setData({
          orderStatus: datas.orderStatus,
        });
      } else {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: res.msg,
          duration: 2000
        });
      }
    });
  },
  //弹出入网协议书
  popAgreement() {
    const that = this;
    that.setData({
      overlay: !that.data.overlay
    });
  },
  //点击获取验证码
  getCode() {
    this.code.creatCodeImg(4);
  },
  //判断是否有预约单
  judgeOrderStatus() {
    const that = this;
    if (that.data.orderId) {
      if (that.data.numberFee > 0 && that.data.orderStatus == 13) { //跳转支付页面
        Dialog.confirm({
          title: '温馨提示',
          message: '本套餐需支付预存款' + that.data.numberFee + '元方可正常激活使用。确认继续？',
          cancelButtonText: '取消',
          confirmButtonText: '确认激活',
        }).then(() => {
          wx.reLaunch({
            url: '/pages/prepay/prepay'
          })
        }).catch(() => {
          //that.onShow();
        });
      } else { //非待支付状态
        if (that.data.numberOperType == '0' || that.data.numberOperType == '1') {
          //0：白卡/普通卡;1：大语音卡
          wx.reLaunch({
            url: '/active/pages/handcard/handcard'
          })
        }
        if (that.data.numberOperType == '2') {
          //2：小号/无实体卡;
          wx.showToast({
            icon: 'none',
            mask: true,
            title: "该号码不支持本渠道激活，如有疑问请联系售卡人员",
            duration: 2000
          });
        }
      }
    } else {
      wx.reLaunch({
        url: '/active/pages/idcard/idcard'
      })
    }
  },
  //跳转链接
  goToUrl() {
    const that = this;
    Dialog.confirm({
      title: '温馨提示',
      message: '本套餐需支付预存款' + that.data.numberFee + '元方可正常激活使用。确认继续？',
      cancelButtonText: '取消',
      confirmButtonText: '确认激活',
    }).then(() => {
      that.judgeOrderStatus();
    }).catch(() => {
      that.onShow();
    });
  },
  //调用系统配置，是否进行活体检测
  checkBioassay() {
    const that = this;
    let url = baseUrl + '/api/user/getSysCfg';
    let parms = {
      cfgType: 'CXC_CFG',
      cfgKey: 'NO_VIDEO_VERIFY'
    }
    return new Promise(function (resolve, reject) {
      POST(url, parms).then(function (res, jet) {
        if (res.code == 200) {
          if (res.datas) {
            let mobile = res.datas.split('#');
            let index = mobile.indexOf(that.data.mobile);
            if (index > 0) {
              app.globalData.isBioass = true;
            } else {
              app.globalData.isBioass = false;
            }
          } else {
            app.globalData.isBioass = false;
          }
        } else {
          app.globalData.isBioass = false;
        }
        resolve(true);
      });
    });
  },
  //调用系统配置，获取限制地区code
  getAreaLimt() {
    let that = this;
    let url = baseUrl + '/api/user/getSysCfg';
    let parms = {
      cfgType: 'SAS_CHECK',
      cfgKey: 'RISK_AREA_CODE'
    };
    return new Promise(function (resolve, reject) {
      POST(url, parms).then(function (res, jet) {
        if (res.code == 200) {
          that.setData({
            areaLim: res.datas
          });
        } else {
          reject(res.msg);
        }
      });
    });
  },
  //地区校验
  checkArea() {
    let that = this;
    if (that.data.numberOperType == '0') {
      let location = wx.getStorageSync('location');
      let adcode = location.ad_info.adcode.slice(0, 4);
      try {
        let areaLim = that.data.areaLim;
        let blackData = JSON.parse(areaLim);
        let blackKeys = Object.keys(blackData);
        //console.log('blackData',blackData);//数据源
        //console.log('blackKeys',blackKeys);//黑名单
        let limit = blackKeys.indexOf(adcode);
        if (limit >= 0) { //存在黑名单中
          let dataKey = blackKeys[limit];
          let whiteList = blackData[dataKey]; //白名单
          let limitValue = whiteList.indexOf(that.data.productId);
          //console.log('that.data.productId',that.data.productId);
          if (limitValue == -1) { //不存在白名单中
            that.areaLog();
            Dialog.alert({
              title: '入网提示',
              message: '您的号码激活信息异常，请重试或联系售卡人员。',
              confirmButtonText: '退出自助激活'
            }).then(() => {
              wx.navigateBack();
            });
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      } catch (error) {
        Dialog.alert({
          title: '温馨提示',
          message: '网络JSON解析失败，请退出重试',
          confirmButtonText: '退出自助激活'
        }).then(() => {
          wx.navigateBack();
        });
        return false;
      }
    } else {
      return true;
    }
  },
  //地区限制日志
  areaLog() {
    let that = this;
    let url = baseUrlP + '/app/login/recordLoginInfo';
    let mobile = wx.getStorageSync('mobile');
    let deviceId = wx.getStorageSync('deviceId');
    let deviceType = wx.getStorageSync('deviceType');
    let osVersion = wx.getStorageSync('osVersion');
    let netWorkType = wx.getStorageSync('netWorkType');
    let location = wx.getStorageSync('location');
    let parms = {
      fromType: 'OpenUser_mianbei',
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
      netWorkType: netWorkType,
      iccid: that.data.iccid
    }
    return new Promise(function (resolve, reject) {
      POST(url, parms).then(function (res, jet) {
        resolve();
      });
    });
  },
  //点击下一步
  nextStep() {
    const that = this;
    if (that.verifyMobile() && that.verifyIccid() && that.verifyYzm() && that.verifyAgreement() && that.verifySubmit() && that.checkArea()) {
      that.checkBioassay().then(() => {
        /* if (that.data.orderStatus != 13 && that.data.numberFee > 0) { //有预约单或者存在预存款
          that.goToUrl();
        } else { //跳转下一步
          that.judgeOrderStatus();
        } */
        that.judgeOrderStatus();
      }).catch((e) => {
        Dialog.alert({
          title: '提示信息',
          message: e,
        }).then(() => {
          wx.navigateBack();
        });
      });
    }
  },
})