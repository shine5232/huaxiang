var app = getApp();
Page({
  data: {
    background: ['/images/banner.png'],
    indicatorDots: false,
    vertical: false,
    circular: true,
    autoplay: false,
    interval: 2000,
    duration: 500
  },
  onLoad: function (options) {},
  onReady: function () {},
  onShow: function () {},
  //跳转页面
  goToPath(e) {
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    })
  },
  goToView(){
    wx.reLaunch({
      url: '/pages/concern/concern'
    })
  },
  handleContact(e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
  },
})