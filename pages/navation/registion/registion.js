import {
  getLocationAuth,
  getLocation,
} from '../../../utils/util'
Page({

  data: {

  },
  onLoad: function (options) {

  },
  onReady: function () {

  },
  onShow: function () {

  },
  //跳转页面
  goToPath(e) {
    let url = e.currentTarget.dataset.url;
    if (url == '/registion/pages/number/number') {
      this.getLocationInfo(url);
    } else {
      wx.navigateTo({
        url: url
      })
    }
  },
  getLocationInfo(url) {
    getLocation().then((res) => {
      wx.hideLoading();
      wx.navigateTo({
        url: url
      })
    }).catch((e) => {
      if (!e) {
        getLocationAuth();
      } else {
        wx.showModal({
          title: '温馨提示',
          content: 'GPS定位信息无法获取，请稍后再试。',
          showCancel: false,
        });
      }
    });
  },
})