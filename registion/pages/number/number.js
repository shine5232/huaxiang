import {
  baseUrl,
  getSysInfo,
  getNetwork,
} from '../../../utils/util'
import {
  POST
} from '../../../utils/promise'
var app = getApp();
Page({
  data: {
    type: 3,
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
    overlaycard: false,
    productDesc: "",
    btnTitle: '下一步，身份证信息登记',
    next: 1,
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
    wx.removeStorageSync('handCard');
    wx.removeStorageSync('mobile');
    wx.removeStorageSync('videoCheck');
    wx.removeStorageSync('fileName');
    wx.removeStorageSync('handId');
    wx.removeStorageSync('simId');
    wx.removeStorageSync('picnamez');
    wx.removeStorageSync('cardType');
    wx.removeStorageSync('certName');
    wx.removeStorageSync('idcard');
    wx.removeStorageSync('numberOperType');
    getSysInfo().then((res) => {
      return getNetwork();
    }).then((res) => {}).catch((e) => {});
  },
  //监听小程序初始化完成
  onShow() {
    const that = this;
    that.setData({
      type: 3,
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
      productDesc: "",
      btnTitle: '下一步，身份证信息登记',
      next: 1,
      productId: '',
    });
  },
  //点击下一步
  nextStep() {
    const that = this;
    if (that.verifyMobile() && that.verifyIccid() && that.verifyAgreement()) {
      let mobile = that.data.mobile;
      let iccid = that.data.iccid;
      that.activeNumber(mobile, iccid);
    }
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
          title: '手机号不正确'
        });
        return false;
      }
      return true;
    }
  },
  //提交验证身份证后6位
  verifyIccid() {
    const that = this;
    let iccid = that.data.iccid.replace(/\s*/g, "");
    if (iccid.length != 6) {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入身份证后6位'
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
  //监听手机号输入
  onChangeMobile(e) {
    let that = this;
    const mobile = e.detail;
    that.setData({
      mobile: mobile
    });
  },
  //监听ICCID输入
  onChangeIccid(e) {
    let that = this;
    const iccid = e.detail;
    that.setData({
      iccid: iccid,
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
    let url = baseUrl + '/api/user/pachRealName';
    let parms = {
      custcertno: iccid,
      svcNumber: mobile
    }
    POST(url, parms, true).then(function (res, jet) {
      console.log(res);
      if (res.code == 200) {
        let datas = res.datas;
        app.globalData.isBioass = false;
        app.globalData.mobile = mobile;
        wx.setStorageSync('mobile', mobile);
        wx.setStorageSync('numberOperType', datas.numberOperType);
        wx.setStorageSync('videoCheck', datas.videoCheck);
        wx.setStorageSync('idcard', datas.certNum);
        wx.setStorageSync('certName', datas.certName);
        wx.setStorageSync('cardType', datas.type);
        if (datas.videoCheck == '1') {
          //录制视频
          wx.reLaunch({
            url: '/registion/pages/notes/notes'
          })
        } else {
          wx.reLaunch({
            url: '/registion/pages/idcard/idcard'
          });
        }
      } else {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: res.msg
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
  //弹出身份证
  popIdcard() {
    const that = this;
    that.setData({
      overlaycard: !that.data.overlaycard
    });
  }
})