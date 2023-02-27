
var app = getApp();
Component({
  properties: {
    width: String,
    height: String,
    len: String,
  },
  data: {
    codeImg: '',
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      const that = this;
     // that.creatCodeImg(that.data.len);
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    onLoad() {

    },
    /**
     * 生成随机4位字符串
     */
    getRandString(len) {
      const that = this;
      len = len || 4;
      /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
      const chars = 'AaBbCcDdEeFfGgHhJjKkMmNnPpQqRrSsTtWwXxYyZz2345678';
      const maxPos = chars.length;
      let randString = '';
      for (let i = 0; i < len; i++) {
        randString += chars.charAt(Math.floor(Math.random() * maxPos));
      }
      //全部转成小写
      wx.setStorageSync('code', randString.toLowerCase());
      return randString;
    },
    /**
     * 绘制验证码图片
     */
    creatCodeImg(len) {
      const that = this;
      const code = that.getRandString(len);
      let code_array = code.split("");
      let canvas = '';
      let ctx = '';
      const query = that.createSelectorQuery();
      query.select('#myCanvas1').fields({ node: true, size: true });
      query.exec((res) => {
        canvas = res[0].node
        ctx = canvas.getContext('2d')
        canvas.width = that.data.width;
        canvas.height = that.data.height;
        let i = canvas.width / len;
        let h = canvas.height / 2;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.setStrokeStyle = '#888';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#888";
        ctx.font = 'normal bold 16px sans-serif';
        code_array.forEach(function (item, index) {
          ctx.fillText(item, (index * i) + 5, h + 5);
        })
        ctx.restore();
        wx.canvasToTempFilePath({
          canvasId: 'firstCanvas',
          fileType: 'jpg',
          canvas: canvas,
          quality: 1, //图片质量
          success(res) {
            that.setData({
              codeImg: res.tempFilePath
            });
          },
          fail(res) { },
        });
      })
    },
  },
});
