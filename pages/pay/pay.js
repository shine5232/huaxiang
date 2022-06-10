import {
  baseUrl
} from '../../utils/util'
import {
  POST
} from '../../utils/promise'
var app = getApp();

Page({
  data: {
    url: '',
    timer: '',
  },
  onLoad: function (options) {
    const that = this;
    let openid = wx.getStorageSync('openid');
    let url = baseUrl + '/api/account/selfHelpRecharge?requestSource=9&orderId=' + options.orderId + '&jsCodeInfo=wx1fc626fdcd5f58db' + encodeURIComponent('#' + openid);
    console.log(url);
    that.setData({
      url: url,
    });
    //that.getOrderInfo(options.orderId);
  },
  getOrderInfo(orderId) {
    const that = this;
    let timer = setInterval(function () {
      that.getOrderInfos(orderId);
    }, 1000);
    that.setData({
      timer: timer
    })
  },
  //查询预约订单详情
  getOrderInfos(orderId) {
    const that = this;
    if (orderId) {
      let url = baseUrl + '/api/order/getOrderInfo';
      let parms = {
        orderId: orderId
      }
      POST(url, parms).then(function (res, jet) {
        console.log(res);
        if (res.code == 200) {
          if (res.datas.orderStatus != 13) { //支付成功
            clearInterval(that.data.timer);
            wx.reLaunch({
              url: '/pages/complete/complete'
            })
          }
        }
      });
    }
  },
  onHide() {
    const that = this;
    //clearInterval(that.data.timer);
  },
  onUnload() {
    const that = this;
    //clearInterval(that.data.timer);
  },
})