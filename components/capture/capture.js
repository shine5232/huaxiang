import {
  formatTime
} from '../../utils/util'
var app = getApp();
Component({
  properties: {
    cardType: String,
    rotate: Boolean,
  },
  observers: {
    'cardType': function (e) {
      const that = this;
      if (e == 3) {
        that.setData({
          cardPosition: 'front'
        })
      } else {
        that.setData({
          cardPosition: 'back'
        })
      }
    }
  },
  data: {
    cameraHeight: wx.getSystemInfoSync().windowHeight,
    cameraWidth: wx.getSystemInfoSync().windowWidth,
    hide: true,
    rotateImg: true,
    cardPosition: 'back',
    myCanvas1_canvas: '',
    myCanvas1_ctx: '',
    animation: '',
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      const that = this;
      const query = that.createSelectorQuery();
      query.select('#myCanvas1').fields({
        node: true,
        size: true
      });
      query.exec((res) => {
        const canvas1 = res[0].node
        const ctx1 = canvas1.getContext('2d')
        canvas1.width = app.globalData.windowWidth
        that.setData({
          myCanvas1_canvas: canvas1,
          myCanvas1_ctx: ctx1,
        });
      })
      //console.log(that);
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    onLoad() {},
    //拍摄照片
    takePhoto() {
      const that = this;
      const ctx = wx.createCameraContext()
      ctx.takePhoto({
        quality: 'high',
        success: (res) => {
          let option = {
            canvas: that.data.myCanvas1_canvas,
            ctx: that.data.myCanvas1_ctx,
            canvasId: 'firstCanvas',
            imgsrc: res.tempImagePath,
            destWidth: that.data.cameraWidth,
            destHeight: that.data.cameraHeight,
            fileType: 'jpg',
            index: that.data.cardType
          }
          that.outImg(option).then((data) => {
            that.triggerEvent("takePhotos", {
              cardType: that.data.cardType,
              imgPath: data
            });
          }).catch((error) => {});
        },
        fail: (e) => {
          console.log(e);
        }
      });
    },
    //取消操作
    canclePhoto() {
      const that = this;
      that.triggerEvent("canclePhotos");
    },
    //切换摄像头
    exchangePosition() {
      const that = this;
      that.setData({
        cardPosition: that.data.cardPosition == 'front' ? 'back' : 'front',
      })
      const animation = wx.createAnimation();
      if (that.data.rotateImg) {
        animation.rotate(360).step({
          duration: 1000
        });
        that.setData({
          animation: animation.export()
        });
      } else {
        animation.rotate(0).step({
          duration: 1000
        });
        that.setData({
          animation: animation.export()
        });
      }
      that.setData({
        rotateImg: !that.data.rotateImg
      });
    },
    //输出图片并添加水印
    outImg(options) {
      const that = this;
      return new Promise(function (resolve, reject) {
        let img = options.canvas.createImage();
        img.src = options.imgsrc;
        img.onload = function () {
          const t = this;
          options.canvas.width = this.width;
          options.canvas.height = this.height;
          //options.ctx.fillStyle = "#FFFFFF";
          options.ctx.fillRect(0, 0, options.canvas.width, options.canvas.height);
          options.ctx.restore();
          options.ctx.drawImage(img, 0, 0);
          options.ctx.font = '30px sans-serif';
          options.ctx.textAlign = 'center';
          options.ctx.fillStyle = "#cccccc";
          options.ctx.globalAlpha = 0.3;
          options.ctx.translate(app.globalData.windowHeight - 100, -120);
          options.ctx.rotate(40 * Math.PI / 180);
          options.ctx.fillText('仅用于华翔联信实名认证' + formatTime(new Date()) + ' D300000169', app.globalData.windowWidth, app.globalData.windowHeight);
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            canvasId: options.canvasId,
            fileType: options.fileType,
            canvas: options.canvas,
            quality: 1, //图片质量
            success(res) {
              console.log('res', res.tempFilePath);
              resolve(res.tempFilePath);
            },
            fail(res) {
              reject(false);
            },
            complete(res) {}
          }, that)
        }
      });
    },
  },
});