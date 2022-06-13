Page({
  data: {
  },
  onLoad: function (options) {
    let option = JSON.parse(options.option);
    wx.openLocation({
      latitude:Number(option.location.latitude),
      longitude:Number(option.location.longitude),
      name:option.name,
      address:option.addr,
      success:function(res){
        console.log(res);
      },
      fail:function(e){
        console.log(e);
      }
    });
  },
  onReady: function () {},
  onShow: function () {
  },
})