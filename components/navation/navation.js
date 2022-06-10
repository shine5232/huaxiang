
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
    hidden:true,
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      const that = this;
      if(that.data.from == 'number'){
        that.setData({
          hidden:false
        });
      }else{
        that.setData({
          hidden:true
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
      const that = this;
      if(that.data.from == 'act_number' || that.data.from == 'act_complete'){
        wx.reLaunch({
          url: '/pages/navation/active/active'
        })
      }else if(that.data.from == 'reg_number' || that.data.from == 'reg_complete'){
        wx.reLaunch({
          url:'/pages/navation/registion/registion'
        });
      }else if(that.data.from == 'reg_nav' || that.data.from == 'act_nav'){
        return false;
      }else{
        wx.navigateBack();
      }
    },
  },
});
