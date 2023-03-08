import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog'
import {
  baseUrl,
} from '../../../utils/util'
import {
  POST
} from '../../../utils/promise'
var app = getApp();
Page({
  data: {
    type: 4,
    active: 2,
    mobile: '',
    name: '',
    area: '',
    code: '',
    address: '',
    provinceCode: '',
    cityCode: '',
    countyCode: '',
    provinceName: '',
    cityName: '',
    countyName: '',
    title: '确认提交',
    sendCode: '发送验证码',
    sendDisabled: false,
    showAddress: false,
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
    areaList: [],
    dialog: true,
  },
  onLoad(options) {

  },
  onReady() {

  },
  onShow() {
    let that = this;
    that.initAreaInfo();
    that.showDialog();
  },
  onUnload() {
    app.globalData.second = 60;
    clearInterval(app.globalData.timer);
    app.globalData.timer = null;
  },
  showDialog() {
    let that = this;
    if (that.data.dialog) {
      Dialog.alert({
        title: '温馨提示',
        message: '请您认真填写联系人的相关信息，后续如需取消预约，将以此信息做为依据！',
        theme: 'round-button',
        confirmButtonText: '我知道了',
      }).then(() => {
        that.setData({
          dialog: false
        });
      });
    }
  },
  //监听验证码发送
  onSendCode() {
    let that = this;
    if (that.data.mobile == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入联系电话'
      });
      return false;
    } else {
      if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(that.data.mobile)) {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: '联系电话格式不正确'
        });
        return false;
      }
    }
    let url = baseUrl + '/api/commonRes/sendSmsCode';
    let parms = {
      linkPhone: that.data.mobile,
      smsCodeType: 'SUBSCRIBE_SUBMIT'
    }
    POST(url, parms).then(function (res, jet) {
      console.log('res', res);
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
  //初始化省市区
  initAreaInfo() {
    let that = this;
    that.getAreaInfo('1', '00').then((res) => {
      return that.getAreaInfo('2', res[0].areaCode);
    }).then((res) => {
      that.getAreaInfo('3', res[0].areaCode);
    });
  },
  //监听手机号
  onChangeMobile(e) {
    let that = this;
    const mobile = e.detail;
    that.setData({
      mobile: mobile
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
  //监听联系人输入
  onChangeName(e) {
    let that = this;
    const name = e.detail;
    that.setData({
      name: name
    });
  },
  //展示省市区弹出层
  showArea() {
    this.setData({
      showAddress: true,
    });
  },
  //关闭省市区弹出层
  hideArea() {
    let that = this;
    that.setData({
      showAddress: false
    });
  },
  //监听省市区选择确认
  onAddressConfirm(e) {
    let that = this;
    let data = e.detail.value;
    let area = [];
    data.forEach((item, index) => {
      console.log('item', item);
      if (item != undefined) {
        area.push(item.areaName);
      }
    });
    let areaInfo = area.join('-');
    that.setData({
      area: areaInfo,
      provinceCode: data[0].areaCode,
      cityCode: data[1].areaCode,
      countyCode: data[2].areaCode,
    });
    that.hideArea();
  },
  //监听选项改变
  onAddressChange(e) {
    let that = this;
    let index = e.detail.index;
    let code = e.detail.value[index].areaCode;
    if (index == '0') { //选择了省份
      that.getAreaInfo('2', code).then((res) => {
        return that.getAreaInfo('3', res[0].areaCode);
      });
    }
    if (index == '1') { //选择了地市
      that.getAreaInfo('3', code);
    }
  },
  //获取省市区信息
  getAreaInfo(areaLevel, code) {
    let that = this;
    let url = baseUrl + '/api/comm/selectAreaInfo';
    let parms = {
      areaLevel: areaLevel,
      parentAreaCode: code
    }
    return new Promise((resolve, reject) => {
      POST(url, parms).then(function (res, jet) {
        if (res.code == 200) {
          let datas = res.datas.area;
          if (areaLevel == '1') {
            let obg = 'areaList[0].values';
            that.setData({
              [obg]: datas,
            });
          } else if (areaLevel == '2') {
            let obg = 'areaList[1].values';
            that.setData({
              [obg]: datas,
            });
          } else if (areaLevel == '3') {
            let obg = 'areaList[2].values';
            that.setData({
              [obg]: datas
            });
          }
          resolve(datas);
        } else {
          wx.showToast({
            icon: 'none',
            mask: true,
            title: res.msg,
            duration: 2000
          });
        }
        reject();
      });
    });
  },
  //监听详细地址
  onChangeAddress(e) {
    let that = this;
    const address = e.detail;
    that.setData({
      address: address
    });
  },
  //点击下一步操作
  nextStep() {
    const that = this;
    if (that.verifyIdCarda()) {
      that.creatOrder();
    }
  },
  //提交验证
  verifyIdCarda() {
    const that = this;
    if (that.data.name == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入联系人姓名'
      });
      return false;
    }
    if (that.data.mobile == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入联系电话'
      });
      return false;
    } else {
      if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(that.data.mobile)) {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: '联系电话格式不正确'
        });
        return false;
      }
    }
    if (that.data.code == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入短信验证码'
      });
      return false;
    }
    if (that.data.area == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请选择省市区'
      });
      return false;
    }
    if (that.data.address == '') {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请输入详细地址'
      });
      return false;
    }
    return true;
  },
  //创建预约订单
  creatOrder() {
    const that = this
    let url = baseUrl + '/api/order/subscribeSubmit';
    let params = wx.getStorageSync('params');
    params.svcNumber = app.globalData.mobile;
    params.cardNumber = app.globalData.iccid;
    params.fechType = '1';
    params.orderSubType = '441';
    params.linkName = that.data.name;
    params.linkPhone = that.data.mobile;
    params.smsCode = that.data.code;
    params.provinceCode = that.data.provinceCode;
    params.cityCode = that.data.cityCode;
    params.countyCode = that.data.countyCode;
    params.addressDetail = that.data.address;
    console.log('params', params);
    POST(url, params, 1).then(function (res, jet) {
      if (res.code == 200) {
        wx.reLaunch({
          url: '/reservation/pages/complete/complete'
        });
      } else {
        wx.showToast({
          icon: 'none',
          title: res.msg
        });
      }
    });
  },
})