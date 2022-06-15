import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
var app = getApp();
Page({
  data: {
    type: 1,
    active: 3,
    mobile: '',
    money: '',
    productName: '',
    show: false,
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
  },
  onLoad: function (options) {
    const that = this;
    that.setData({
      type: app.globalData.steps,
      mobile: app.globalData.mobile,
      money: app.globalData.productInfo.numberFee,
      productName: app.globalData.productInfo.productName,
    });
  },
  onShow() {},
  nextStep() {
    Dialog.confirm({
      title: '温馨提示',
      message: '退出后订单将为您保留1小时，超时后自动取消订单。您确定退出激活流程？',
      cancelButtonText: '确认退出',
      confirmButtonText: '去支付',
    }).then(() => {
      wx.reLaunch({
        url: '/pages/pay/pay?orderId=' + app.globalData.orderId
      })
    }).catch(() => {
      wx.reLaunch({
        url: '/active/pages/number/number'
      })
    });
  },
})