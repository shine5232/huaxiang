import {
  baseUrl,
  watermark
} from '../../../utils/util'
import {
  POST,
  FILE
} from '../../../utils/promise'
var app = getApp();
Page({
  data: {
    type: 3,
    active: 1,
    fileLista: '',
    fileListb: '',
    capture: [{
      type: 1,
      title: '拍摄'
    }, {
      type: 2,
      title: '从相册选择'
    }],
    show: false,
    showInfo: false,
    cardType: 4,
    position: 'back',
    captureHidden: true,
    rotate: false,
    mobile: '',
    area: '',
    back: 0,
    isBioass: true,
    title: '下一步，活体检测',
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
    canvas1: null,
    ctx1: null,
  },
  onLoad() {
    const that = this;
    that.setData({
      isBioass: !app.globalData.isBioass,
      title: app.globalData.isBioass ? '下一步' : '下一步，活体检测',
    });
    that.appCanLocalUpload();
  },
  onReady() {
    const that = this;
    const query = wx.createSelectorQuery();
    query.select('#myCanvas1').fields({
      node: true,
      size: true
    }).exec((res) => {
      const canvas1 = res[0].node;
      const ctx1 = canvas1.getContext('2d');
      that.setData({
        canvas1,
        ctx1
      });
    });
  },
  onShow() {},
  //弹出选择提示框
  showPopup(e) {
    const that = this;
    const type = e.currentTarget.dataset.type;
    that.setData({
      showInfo: true,
      cardType: type
    });
  },
  //关闭选择提示框
  onClose() {
    this.setData({
      showInfo: false,
      show: true,
    });
  },
  //监听选择取消
  onCancle() {
    this.setData({
      show: false,
    });
  },
  //监听选择确认
  confirm(e) {
    const that = this;
    const type = e.currentTarget.dataset.type;
    that.setData({
      show: false
    });
    if (type == 1) { //拍摄
      that.setData({
        captureHidden: false,
        back: 1,
      });
    } else { //从相册选择
      wx.chooseMedia({
        count: 1,
        mediaType:['image'],
        sizeType: ['original', 'compressed'],
        sourceType: ['album'],
        success(res) {
          watermark(res.tempFiles[0].tempFilePath,that).then((ret)=>{
            that.submitImgUpload(that.data.cardType, ret);
          });
        }
      })
    }
  },
  //监听拍照
  takePhotos(e) {
    const that = this;
    that.setData({
      captureHidden: true
    });
    that.submitImgUpload(e.detail.cardType, e.detail.imgPath);
  },
  //提交图片上传
  submitImgUpload(type, imgPath) {
    const that = this;
    if (type == 4) {
      that.upLoadImg('clientFile', imgPath, 3).then((data) => {
        wx.setStorageSync('handId', data.datas.picnamehand);
        that.setData({
          fileLista: imgPath
        });
      }).catch((error) => {});
    } else if (type == 5) {
      that.upLoadImg('clientFile', imgPath, 3).then((data) => {
        wx.setStorageSync('simId', data.datas.picnamehand);
        that.setData({
          fileListb: imgPath
        });
      }).catch((error) => {});
    }
  },
  //监听拍照取消
  canclePhotos() {
    const that = this;
    that.setData({
      captureHidden: true,
      back: 0,
    });
  },
  //验证身份证正面是否上传
  verifyIdCarda() {
    const that = this;
    if (that.data.fileLista == '') {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请上传手持照片'
      });
      return false;
    }
    if (that.data.fileListb == '') {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请上传SIM卡照片'
      });
      return false;
    }
    return true;
  },
  //是否可本地上传图片
  appCanLocalUpload() {
    const that = this;
    let url = baseUrl + '/api/user/appCanLocalUpload';
    POST(url).then(function (res, jet) {
      if (res.code == 200) {
        let datas = res.datas;
        if (datas.uploadConfig == 0) {
          that.setData({
            capture: [{
              type: 1,
              title: '拍摄'
            }],
          });
        }
      }
    });
  },
  //图片上传
  upLoadImg(fileName, clientFile, type) {
    const url = baseUrl + '/api/uploadFileSas'
    const that = this;
    let mobile = wx.getStorageSync('mobile');
    let param = {
      fileName: new Date().getTime() + '_' + mobile,
      fechType: 1,
      type: type
    };
    return new Promise(function (resolve, reject) {
      FILE(url, fileName, clientFile, param,1,1)
        .then((res) => {
          console.log('上传成功：', res);
          if (res.code == 200) {
            wx.showToast({
              icon:'none',
              title:'照片上传成功'
            });
            resolve(res);
          } else {
            wx.showToast({
              icon:'none',
              title:'照片上传失败'
            });
            reject(res);
          }
        })
        .catch((error) => {
          console.log('上传失败：', error);
          wx.showToast({
            icon:'none',
            title:'照片上传失败'
          });
          reject(error);
        });
    });
  },
  //点击下一步操作
  nextStep() {
    const that = this;
    if (app.globalData.isBioass) {
      wx.navigateTo({
        url: '/registion/pages/bioassay/bioassay'
      })
    } else {
      if (that.verifyIdCarda()) {
        wx.navigateTo({
          url: '/registion/pages/bioassay/bioassay'
        })
      }
    }
  },
})