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
      console.log('a',res);
      qqmapsdk.calculateDistance({
        mode:'driving',
        from:{
          latitude:res.result.location.lat,
          longitude:res.result.location.lng
        },
        to:[{
          latitude:'39.934411',
          longitude:'116.349794'
        }],
        success:function(res){
          console.log(res);
          var res = res.result;
          var dis = [];
          for (var i = 0; i < res.elements.length; i++) {
            let num = res.elements[i].distance / 1000;
            dis.push(num.toFixed(2)); //将返回数据存入dis数组，
          }
          that.setData({
            distance:dis
          });
        },
        fail: function(error) {
          console.error(error);
        },
        complete: function(res) {
          wx.hideLoading();
        }
      });
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
  daoHang(){
    wx.showModal({
      title: '温馨提示',
      content: '您是要去这里吗？',
      success: function (res) {
        if(res.confirm){
          console.log('sss');
        }
      },
    });
  }
})