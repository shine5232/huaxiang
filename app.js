require('./utils/overWrite')
// app.js
App({
  globalData: {
    steps: 1, //步骤条 1：三步(号码确认，身份识别，告知签署),2:四步(号码确认，身份识别，告知签署，预存支付),默认1
    mobile: '', //用户手机号
    isBioass: true, //true:不展示活体检测
    iccid: '', //ICCID
    chnlCode: '', //渠道编码
    productInfo: '', //产品信息
    windowWidth: wx.getSystemInfoSync().windowWidth, //屏幕宽度
    windowHeight: wx.getSystemInfoSync().windowHeight, //屏幕高度
    pixelRatio: wx.getSystemInfoSync().pixelRatio, //屏幕像素比
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    location: {}, //位置信息
    qqmapsdk: {}, //mapsdk
    sessionId: null, //会话id
    numberOperType: null, //号码类型
    orderId: '', //订单id
    piclivebest: null, //最佳活体照id
    piclivestdA: null, //标准活体照A
    piclivestdB: null, //标准活体照B
    opIds: [], //三张活体照片
    signImg: '', //签署图片
    active: false, //是否激活
    deviceId: null, //设备ID
    deviceType: null, //设备类型
    osVersion: null, //系统版本
    netWorkType: null, //网络类型
    netWorkStatus: true, //网络状态
    version: null, //小程序版本号
    timer: null, //验证码计数器
    second: 60, //倒计时
    needReservation:false,//是否需要预约
  },
  onLaunch() {
    this.getVersion();
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  onShow() {
    this.netWorkStatus();
  },
  netWorkStatus() {
    const that = this;
    wx.onNetworkStatusChange((res) => {
      that.globalData.netWorkStatus = res.isConnected;
    });
  },
  getVersion() {
    let accountInfo = wx.getAccountInfoSync();
    this.globalData.version = accountInfo.miniProgram.version;
    console.log('当前版本', this.globalData.version);
  },
})