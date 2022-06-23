var app = getApp();
Component({
  properties: {
    title: String,
    from: String,
  },
  data: {
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
    hidden: true,
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      const that = this;
      if (that.data.from == 'number') {
        that.setData({
          hidden: false
        });
      } else {
        that.setData({
          hidden: true
        });
      }
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    onLoad() {

    },

    /**
     * 监听返回按钮
     */
    goBack() {
      let fromUrl = wx.getStorageSync('fromUrl');
      if (fromUrl != undefined && fromUrl != '') {
        wx.reLaunch({
          url: fromUrl
        })
      } else {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    },
  },
});