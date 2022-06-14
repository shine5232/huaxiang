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
    if (url == '/active/pages/number/number') {
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
          content: '系统检查到未开启GPS定位服务，请打开定位',
          showCancel: false,
        });
      }
    });
  },
})