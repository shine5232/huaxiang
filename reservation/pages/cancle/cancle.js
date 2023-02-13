import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog'
import {
  baseUrl,
  IdentityCodeValid
} from '../../../utils/util'
import {
  POST
} from '../../../utils/promise'
var app = getApp();
Page({
  data: {
    mobile: '',
    card: '',
    yzm: '',
    phone: '',
    code: '',
    query: false,
    btnTitle: '查询',
    sendCode: '发送验证码',
    sendDisabled: false,
    inputDisabled: false
  },
  //页面加载完成
  onLoad() {
    const that = this;
    that.code = that.selectComponent("#code");
  },
  //监听小程序初始化完成
  onShow() {
    const that = this;
    that.getCode();
    that.setData({
      mobile: '',
      card: '',
      yzm: '',
      phone: '',
      code: '',
      query: false,
      btnTitle: '查询',
    });
  },
  onUnload() {
    app.globalData.second = 60;
    clearInterval(app.globalData.timer);
    app.globalData.timer = null;
  },
  //提交验证手机号
  verifyMobile() {
    const that = this;
    if (that.data.mobile == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入预约手机号'
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
    }
    return true;
  },
  //提交验证身份证
  verifyIccid() {
    const that = this;
    const card = that.data.card;
    if (card == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入预约身份证号'
      });
      return false;
    } else {
      let res = IdentityCodeValid(card);
      if (!res) {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: '请输入正确的身份证号码'
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
        title: '请输入图形验证码'
      });
      return false;
    } else {
      let code = wx.getStorageSync('code');
      if (yzm.toLowerCase() != code) {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: '图形验证码不正确'
        });
        return false;
      } else {
        return true;
      }
    }
  },
  //提交验证短信验证码
  verifyCode() {
    let that = this;
    if (that.data.code == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入短信验证码'
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
  //监听身份证输入
  onChangeIccid(e) {
    let that = this;
    const card = e.detail;
    that.setData({
      card: card,
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
  //监听短信验证码
  onChangeCode(e) {
    let that = this;
    const code = e.detail;
    that.setData({
      code: code
    });
  },
  //监听验证码发送
  onSendCode() {
    let that = this;
    let url = baseUrl + '/api/commonRes/sendSmsCode';
    let parms = {
      linkPhone: that.data.phone,
      smsCodeType: 'SUBSCRIBE_CANEL'
    }
    POST(url, parms).then(function (res, jet) {
      if (res.code == 200) {
        that.timeOut();
      } else {
        wx.showToast({
          icon: 'none',
          title: res.msg,
          duration: 2000
        });
      }
    });
  },
  //验证码倒计时逻辑
  timeOut() {
    let that = this;
    if (app.globalData.timer == null) {
      that.setData({
        sendDisabled: true
      });
      app.globalData.timer = setInterval(() => {
        if (app.globalData.second > 1) {
          app.globalData.second--;
          that.setData({
            sendCode: app.globalData.second + ' 秒后再获取'
          });
        } else {
          app.globalData.second = 60;
          clearInterval(app.globalData.timer);
          app.globalData.timer = null;
          that.setData({
            sendDisabled: false,
            sendCode: '发送验证码'
          });
        }
      }, 1000);
    } else {
      that.setData({
        sendDisabled: true
      });
    }
  },
  //调用号卡查询接口
  activeNumber(mobile, card) {
    const that = this;
    let url = baseUrl + '/api/order/subscribeLinkPhone';
    let parms = {
      custcertno: card,
      svcNumber: mobile
    }
    POST(url, parms).then(function (res, jet) {
      //that.code.creatCodeImg(4);
      if (res.code == 200) {
        let datas = res.datas;
        console.log('datas', datas);
        app.globalData.mobile = that.data.mobile;
        app.globalData.card = that.data.card;
        that.setData({
          query: true,
          phone: datas.linkPhone,
          inputDisabled: true,
          btnTitle: '提交确认'
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
  //点击获取验证码
  getCode() {
    this.code.creatCodeImg(4);
  },
  //取消预约
  cancelReservation() {
    let that = this;
    let url = baseUrl + '/api/order/subscribeCancel';
    let parms = {
      svcNumber: that.data.mobile,
      custcertno: that.data.card,
      linkPhone: that.data.phone,
      smsCode: that.data.code
    }
    POST(url, parms).then(function (res, jet) {
      if (res.code == 200) {
        Dialog.alert({
          title: '取消预约成功！',
          message: '预约登记手机号：' + that.data.mobile + "\n" + '您已成功取消预约，感谢您的使用！',
          theme: 'round-button',
          confirmButtonText: '确认关闭',
        }).then(() => {
          wx.reLaunch({
            url: '/pages/index/index'
          });
        });
      } else {
        if(res.code == 400){
          Dialog.alert({
            title: '取消预约失败！',
            message: res.msg,
            theme: 'round-button',
            confirmButtonText: '确认关闭',
          }).then(() => {
            wx.navigateBack();
          });
        }else{
          wx.showToast({
            icon: 'none',
            mask: true,
            title: res.msg
          });
        }
      }
    });
  },
  //点击下一步
  nextStep() {
    const that = this;
    if (that.verifyMobile() && that.verifyIccid() && that.verifyYzm()) {
      if (that.data.query) {
        if (that.verifyCode()) {
          that.cancelReservation();
        }
      } else {
        that.activeNumber(that.data.mobile, that.data.card);
      }
    }
  },
})