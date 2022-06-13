var app = getApp();
import {
  getLocationAuth,
  getLocation,
  qqmapsdk
} from '../../utils/util'
Page({
  data: {
    background: ['/images/banner.png'],
    indicatorDots: false,
    vertical: false,
    circular: true,
    autoplay: false,
    interval: 2000,
    duration: 500,
    type:0,
    distance:[],
    shopData:[{
      logo:'',
      name:'北京华翔联信(展览路)',
      tel:'10036',
      location:{
        latitude:'39.934411',
        longitude:'116.349794'
      },
      time:'9:00-18:00',
      addr:'北京市西城区展览路街道京桥国际公馆',
      distance:0
    },{
      logo:'',
      name:'北京华翔联信(西直门)',
      tel:'10036',
      location:{
        latitude:'39.937775',
        longitude:'116.341732'
      },
      time:'9:00-18:00',
      addr:'北京市西城区西直门南大街168号',
      distance:0
    }],
  },
  onLoad: function (options) {},
  onReady: function () {},
  onShow: function () {
    this.getLocationInfo();
  },
  //跳转页面
  goToPath(e) {
    let url = e.currentTarget.dataset.url;
    if(url == 'a'){
      this.getLocationInfo();
    }else{
      wx.navigateTo({
        url: url
      })
    }
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
  getLocationInfo(){
    var that = this;
    getLocation().then((res)=>{
      wx.showLoading({title:'加载中...'});
      return that.getDistance(res.result.location);
    }).then((res)=>{
      wx.hideLoading();
    }).catch((e)=>{
      if(!e){
        getLocationAuth();
      }else{
        wx.showModal({
          title: '温馨提示',
          content: '位置信息解析失败，请稍后重试！',
          showCancel: false,
        });
      }
    });
  },
  daoHang(e){
    let option = e.currentTarget.dataset.option;
    const that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您是要去这里吗？',
      success: function (res) {
        if(res.confirm){
          wx.navigateTo({
            url: '/pages/map/map?option='+JSON.stringify(option)
          })
        }
      },
    });
  },
  getDistance(location){
    const that = this;
    return new Promise(function(resolve,reject){
      qqmapsdk.calculateDistance({
        mode:'driving',
        from:{
          latitude:location.lat,
          longitude:location.lng
        },
        to:[{
          latitude:'39.934411',
          longitude:'116.349794'
        },{
          latitude:'39.937775',
          longitude:'116.341732'
        }],
        success:function(res){
          console.log(res);
          var res = res.result;
          for (var i = 0; i < res.elements.length; i++) {
            let num = (res.elements[i].distance / 1000).toFixed(2);
            let obg = 'shopData['+i+'].distance';
            that.setData({
              [obg]:num
            });
          }
          resolve(true);
        },
        fail: function(error) {
          reject(false);
        }
      });
    });
  },
  //获取后台配置接口
  getType(){

  }
})