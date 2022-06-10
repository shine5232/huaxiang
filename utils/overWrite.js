const {
  showModal
} = wx;
Object.defineProperty(wx, 'showModal', {
  configurable: false, // 是否可以配置
  enumerable: false, // 是否可迭代
  writable: false, // 是否可重写
  value(...param) {
    return new Promise(function (rs, rj) {
      let { success, fail, complete, confirmStay } = param[0]
      param[0].success = (res) => {
        res.navBack = (res.confirm && !confirmStay) || (res.cancel && confirmStay)
        wx.setStorageSync('showBackModal', !res.navBack)
        success && success(res)
        rs(res)
      }
      param[0].fail = (res) => {
        fail && fail(res)
        rj(res)
      }
      param[0].complete = (res) => {
        complete && complete(res)
        (res.confirm || res.cancel) ? rs(res) : rj(res)
      }
      return showModal.apply(this, param); // 原样移交函数参数和this
    }.bind(this))
  }
});

// =========================================================
const myPage = Page
Page = function(e){
  let { onLoad, onShow, onUnload } = e
  e.onLoad = (() => {
    return function (res) {
      this.app = getApp()
      this.app.globalData = this.app.globalData || {}
      let reinit = () => {
        if (this.app.globalData.lastPage && this.app.globalData.lastPage.route == this.route) {
          this.app.globalData.lastPage.data && this.setData(this.app.globalData.lastPage.data)
          Object.assign(this, this.app.globalData.lastPage.syncProps || {})
        }
      }
      this.useCache = res.useCache

      res.useCache ? reinit() : (onLoad && onLoad.call(this, res))
    }
  })()
  e.onShow = (() => {
    return function (res) {
      !this.useCache && onShow && onShow.call(this, res)
    }
  })()
  e.onUnload = (() => {
    return function (res) {

      this.app.globalData = Object.assign(this.app.globalData || {}, {
        lastPage: this
      })
      onUnload && onUnload.call(this, res)
    }
  })()
  return myPage.call(this, e)
}


wx.onAppRoute(function (res) {
  var a = getApp(), ps = getCurrentPages(), t = ps[ps.length - 1],
    b = a && a.globalData && a.globalData.pageBeforeBacks || {},
    c = a && a.globalData && a.globalData.lastPage || {}
  if (res.openType == 'navigateBack') {
    var showBackModal = wx.getStorageSync('showBackModal')
    if (c.route && showBackModal && typeof b[c.route] == 'function') {
      wx.navigateTo({
        url: '/' + c.route + '?useCache=1',
      })
      b[c.route]().then(res => {
        if (res.navBack){
          a.globalData.pageBeforeBacks = {}
          wx.navigateBack({ delta: 1 })
        }
      })
    }
  } else if (res.openType == 'navigateTo' || res.openType == 'redirectTo' || res.openType == 'appLaunch') {

    if (!a.hasOwnProperty('globalData')) a.globalData = {}
    if (!a.globalData.hasOwnProperty('lastPage')) a.globalData.lastPage = {}
    if (!a.globalData.hasOwnProperty('pageBeforeBacks')) a.globalData.pageBeforeBacks = {}
    
    if (ps.length >= 2 && t.onBeforeBack && typeof t.onBeforeBack == 'function') {
      let { onUnload } = t
      wx.setStorageSync('showBackModal', !0)
      t.onUnload = function () {
        a.globalData.lastPage = {
          route: t.route,
          data: t.data
        }
        onUnload()
      }

    }else{
      //console.log('sss');
    }

    t.onBeforeBack && typeof t.onBeforeBack == 'function' && (a.globalData.pageBeforeBacks[t.route] = t.onBeforeBack)
  }

})