Page({
  data: {
    url: '',
  },
  onLoad: function (options) {
    let url = 'https://mp.weixin.qq.com/s?__biz=MzA5Mzg0NzQxNg==&mid=2651916266&idx=1&sn=b013e571dd95c24cc2f055e4aec11daa&chksm=8bb20dfdbcc584eb560a49e545ee57359d4e40884cff5c0bfb93173b96d468142f90dabfb845#rd';
    //let url = 'https://laravel.harus.icu/weixin.html';
    this.setData({
      url: encodeURI(url),
    });
  },
  onReady: function () {

  },

  onShow: function () {

  },

  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})