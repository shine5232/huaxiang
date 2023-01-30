var app = getApp();
Page({
  data: {
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
    mobile: '',
    title: '',
    from: '',
    note:'',
  },
  onLoad: function (options) {
    const that = this;
    if(options){
      that.setData({
        title: options.title,
        from: options.from,
        note:options.note,
        mobile: wx.getStorageSync('mobile')
      })
    }
  },
  onShow() {},
  gotoUrl() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },

})