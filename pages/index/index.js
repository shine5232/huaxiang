var app = getApp();
import {
  baseUrl,
  getLocationAuth,
  getLocation,
  qqmapsdk
} from '../../utils/util'
import {
  POST
} from '../../utils/promise'
Page({
  data: {
    background: ['/images/banner.png'],
    indicatorDots: false,
    vertical: false,
    circular: true,
    autoplay: false,
    interval: 2000,
    duration: 500,
    type: 1,
    distance: [],
    shopData: [{
      logo: '',
      name: '北京华翔联信(展览路)',
      tel: '10036',
      location: {
        latitude: '39.934411',
        longitude: '116.349794'
      },
      time: '9:00-18:00',
      addr: '北京市西城区展览路街道京桥国际公馆',
      distance: 0
    }, {
      logo: '',
      name: '北京华翔联信(西直门)',
      tel: '10036',
      location: {
        latitude: '39.937775',
        longitude: '116.341732'
      },
      time: '9:00-18:00',
      addr: '北京市西城区西直门南大街168号',
      distance: 0
    }],
  },
  onLoad: function (options) {},
  onReady: function () {},
  onShow: function () {
    wx.setStorageSync('fromUrl', '/pages/index/index');
  },
  //跳转页面
  goToPath(e) {
    let url = e.currentTarget.dataset.url;
    if (url == '/active/pages/number/number' || url == '/registion/pages/number/number') {
      this.getLocationInfo(url);
    } else {
      //wx.hideLoading();
      wx.reLaunch({
        url: url
      })
    }
  },
  goToView() {
    wx.reLaunch({
      url: '/pages/concern/concern'
    })
  },
  handleContact(e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
  },
  getLocationInfo(url = false) {
    var that = this;
    let data = {};
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    getLocation().then((res) => {
      data = res.result.location;
      if (that.data.type == '0') {
        return that.getDistance(data);
      } else {
        if (url) {
          wx.reLaunch({
            url: url
          })
        }
      }
    }).then((e) => {
      wx.hideLoading();
    }).catch((e) => {
      wx.hideLoading();
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
  daoHang(e) {
    let option = e.currentTarget.dataset.option;
    wx.showModal({
      title: '温馨提示',
      content: '您是要去这里吗？',
      success: function (res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/map/map?option=' + JSON.stringify(option)
          })
        }
      },
    });
  },
  getDistance(location) {
    const that = this;
    wx.showLoading({
      title: '加载中...'
    });
    return new Promise(function (resolve, reject) {
      qqmapsdk.calculateDistance({
        mode: 'driving',
        from: {
          latitude: location.lat,
          longitude: location.lng
        },
        to: [{
          latitude: '39.934411',
          longitude: '116.349794'
        }, {
          latitude: '39.937775',
          longitude: '116.341732'
        }],
        success: function (res) {
          console.log(res);
          var res = res.result;
          for (var i = 0; i < res.elements.length; i++) {
            let num = (res.elements[i].distance / 1000).toFixed(2);
            let obg = 'shopData[' + i + '].distance';
            that.setData({
              [obg]: num
            });
          }
          resolve();
        },
        fail: function (error) {
          reject(false);
        },
        complete: function () {
          wx.hideLoading();
        }
      });
    });
  },
  getType() {
    let that = this;
    let url = baseUrl + '/api/user/getSysCfg';
    let parms = {
      cfgType: 'HXXCX_CFG',
      cfgKey: 'ISSHOWMAP'
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    return new Promise(function (resolve, reject) {
      POST(url, parms).then(function (res, jet) {
        wx.hideLoading();
        if (res.code == 200) {
          that.setData({
            type: res.datas
          });
          resolve(res.datas);
        } else {
          reject();
        }
      });
    });
  },
})