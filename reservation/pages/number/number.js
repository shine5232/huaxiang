import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog'
import {
  baseUrl,
  getSysInfo,
  getNetwork
} from '../../../utils/util'
import {
  POST
} from '../../../utils/promise'
var app = getApp();
Page({
  data: {
    type: 4,
    active: 0,
    mobile: '',
    iccid: '',
    yzm: '',
    btnTitle: '下一步',
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
    }).then((res) => {
    }).catch((e) => {});
  },
  //监听小程序初始化完成
  onShow() {
    const that = this;
    that.getCode();
    that.setData({
      type: 4,
      mobile: '',
      iccid: '',
      yzm: '',
    });
  },
  //提交验证手机号
  verifyMobile() {
    const that = this;
    if (that.data.mobile == '') {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请输入手机号'
      });
      return false;
    }else{
      if (!/^1(3|4|5|6|7|8)\d{9}$/.test(that.data.mobile)) {
        wx.showToast({
          icon:'none',
          mask:true,
          title:'手机号不正确'
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
        icon:'none',
        mask:true,
        title:'请输入ICCID'
      });
      return false;
    }else{
      if (!/^[A-Z|0-9]{5}$/.test(iccid)) {
        wx.showToast({
          icon:'none',
          mask:true,
          title:'请输入ICCID后5位'
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
        icon:'none',
        mask:true,
        title:'请输入验证码'
      });
      return false;
    } else {
      let code = wx.getStorageSync('code');
      if (yzm.toLowerCase() != code) {
        wx.showToast({
          icon:'none',
          mask:true,
          title:'验证码不正确'
        });
        return false;
      } else {
        return true;
      }
    }
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
  //监听验证码输入
  onChangeYzm(e) {
    let that = this;
    const yzm = e.detail;
    that.setData({
      yzm: yzm,
    });
  },
  //调用号卡查询接口
  activeNumber(mobile, iccid) {
    const that = this;
    let url = baseUrl + '/api/numCardRes/confirmCardNumber';
    let parms = {
      cardNumber: iccid,
      svcNumber: mobile
    }
    
    POST(url, parms).then(function (res, jet) {
      that.code.creatCodeImg(4);
      if (res.code == 200) {
        let datas = res.datas;
        console.log('datas',datas);
        app.globalData.mobile = that.data.mobile;
        app.globalData.iccid = that.data.iccid;
        app.globalData.chnlCode = datas.chnlCode;
        wx.reLaunch({
          url: '/reservation/pages/idcard/idcard'
        })
      } else {
        wx.showToast({
          icon:'none',
          mask:true,
          title:res.msg,
          duration:2000
        });
      }
    });
  },
  //点击获取验证码
  getCode() {
    this.code.creatCodeImg(4);
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
  //点击下一步
  nextStep() {
    const that = this;
    if (that.verifyMobile() && that.verifyIccid() && that.verifyYzm()) {
      that.checkBioassay().then(function (ret, jet) {
        that.activeNumber(that.data.mobile, that.data.iccid);
      });
    }
  },
})