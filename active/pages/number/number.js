import Toast from '../../../miniprogram_npm/@vant/weapp/toast/toast'
import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog'
import {
  baseUrl,
  baseUrlP,
  getSysInfo,
  login,
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
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
  },
  //页面加载完成
  onLoad() {
    const that = this;
    wx.removeStorageSync('randstring');
    wx.removeStorageSync('idcardA');
    wx.removeStorageSync('idcardB');
    wx.removeStorageSync('mobile');
    wx.removeStorageSync('videoCheck');
    wx.removeStorageSync('fileName');
    wx.removeStorageSync('handId');
    wx.removeStorageSync('simId');
    wx.removeStorageSync('cardType');
    that.code = that.selectComponent("#code");
    login().then((res) => {
      return getSysInfo();
    }).then((res) => {
      return getNetwork();
    }).then((res) => {}).catch((e) => {});
  },
  //监听小程序初始化完成
  onShow() {
    const that = this;
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
      checked: false,
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
    });
  },
  //提交验证手机号
  verifyMobile() {
    const that = this;
    if (that.data.mobile == '') {
      Toast({
        type: 'fail',
        message: '请输入手机号',
        duration: 1000
      });
      return false;
    }
    return true;
  },
  //提交验证ICCID
  verifyIccid() {
    const that = this;
    const iccid = that.data.iccid;
    if (iccid == '') {
      Toast({
        type: 'fail',
        message: '请输入ICCID后五位',
        duration: 1000
      });
      return false;
    }
    return true;
  },
  //提交验证验证码
  verifyYzm() {
    const that = this;
    const yzm = that.data.yzm;
    if (yzm == '') {
      Toast({
        type: 'fail',
        message: '请输入验证码',
        duration: 1000
      });
      return false;
    } else {
      let code = wx.getStorageSync('code');
      if (yzm.toLowerCase() != code) {
        Toast({
          type: 'fail',
          message: '验证码不正确',
          duration: 1000
        });
        return false;
      } else {
        return true;
      }
    }
  },
  //提交验证协议是否勾选
  verifyAgreement() {
    const that = this;
    if (!that.data.checked) {
      Toast({
        type: 'fail',
        message: '请同意并勾选协议',
        duration: 1000
      });
      return false;
    }
    return true;
  },
  //提交验证号码状态
  verifySubmit() {
    const that = this;
    if (!that.data.submit) {
      Toast({
        type: 'fail',
        message: that.data.message,
        duration: 1000
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
      if (res.code == 200) {
        let datas = res.datas;
        wx.setStorageSync('picnamez', datas.picnamez);
        app.globalData.iccid = datas.iccid;
        app.globalData.mobile = that.data.mobile;
        wx.setStorageSync('mobile', mobile);
        app.globalData.numberOperType = datas.numberOperType;
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
        app.globalData.steps = datas.numberFee > 0 ? 2 : 1;
        if (datas.orderId) { //存在预约订单
          that.getOrderInfo(datas.orderId);
        }
        if (datas.numberOperType == 0) {
          that.getMianBei();
        }
      } else {
        Toast({
          type: 'fail',
          message: res.msg,
          duration: 1000
        });
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
    POST(url, parms, true).then(function (res, jet) {
      if (res.code == 200) {
        let datas = res.datas;
        app.globalData.orderId = orderId;
        that.setData({
          orderStatus: datas.orderStatus,
        });
      } else {
        Toast.fail(res.msg);
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
      if (that.data.orderStatus == 13) { //待支付状态，跳转支付页面
        wx.navigateTo({
          url: '/active/pages/prepay/prepay?orderId=' + that.data.orderId
        })
      } else { //非待支付状态
        if (that.data.numberOperType == 0 || that.data.numberOperType == 1) {
          //0：白卡/普通卡;1：大语音卡
          wx.navigateTo({
            url: '/active/pages/handcard/handcard'
          })
        }
        if (that.data.numberOperType == 2) {
          //2：小号/无实体卡;
          wx.navigateTo({
            url: '/active/pages/bioassay/bioassay'
          })
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
      cancelButtonText: '返回首页',
      confirmButtonText: '确认激活',
    }).then(() => {
      that.judgeOrderStatus();
    }).catch(() => {
      that.onShow();
    });
  },
  //调用系统配置，检测该账号是否进行活体检测
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
  //调用系统配置
  getMianBei() {
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
  //地区限制
  checkArea(){
    let that = this;
    let location = wx.getStorageSync('location');
    let adcode = location.ad_info.adcode.slice(0,4);
    let limit = that.data.areaLim.split('#');
    let has = limit.indexOf(adcode);
    if(has){
      Dialog.alert({
        title: '入网提示',
        message: '您的号码激活信息异常，请重试或联系售卡人员。',
        confirmButtonText:'退出自助激活'
      }).then(() => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      });
      return false;
    }else{
      return true;
    }
  },
  //点击下一步
  nextStep() {
    const that = this;
    if (that.verifyMobile() && that.verifyIccid() && that.verifyYzm() && that.verifyAgreement() && that.verifySubmit() && that.checkArea()) {
      that.checkBioassay().then(function (ret, jet) {
        if (that.data.orderStatus == 13) { //存在预存
          that.goToUrl();
        } else { //跳转下一步
          that.judgeOrderStatus();
        }
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
  onUnload() {
    console.log('number页面销毁了');
  }
})