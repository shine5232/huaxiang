import Toast from '../../../miniprogram_npm/@vant/weapp/toast/toast'
import {
  baseUrl,
  formatDates
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
    mobile: '',
    mobileMessage: '',
    capture: [{
      type: 1,
      title: '拍摄'
    }, {
      type: 2,
      title: '从相册选择'
    }],
    fileLista: '',
    fileListb: '',
    fileListc: '',
    show: false,
    cardType: 1,
    position: 'back',
    captureHidden: true,
    rotate: false,
    back: 0,
    showT: false,
    img1: 0,
    img2: 0,
    img3: 0,
    isBioass: true,
    title: '下一步，手持验证',
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
  },
  onLoad() {
    const that = this;
    that.setData({
      isBioass: !app.globalData.isBioass,
    });
    let cardType = wx.getStorageSync('cardType') ? '下一步' : '下一步，手持验证';
    that.setData({
      title: cardType
    });
    that.appCanLocalUpload();
  },
  //页面渲染
  onShow() {},
  //监听手机号
  onChangeMobile(e) {
    let that = this;
    const mobile = e.detail;
    that.setData({
      mobile: mobile
    });
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
  //提交验证
  verifyIdCarda() {
    const that = this;
    let idcardA = wx.getStorageSync('idcardA');
    let idcardB = wx.getStorageSync('idcardB');
    let name = wx.getStorageSync('certName');
    let idcard = wx.getStorageSync('idcard');
    let time = formatDates(new Date());
    if (that.data.fileLista == '') {
      Toast.fail('请上传身份证人像面照片');
      return false;
    }
    if (that.data.fileListb == '') {
      Toast.fail('请上传身份证国徽面照片');
      return false;
    }
    if (that.data.img1 == 0) {
      Toast.fail('请重新上传身份证人像面照片');
      return false;
    }
    if (that.data.img2 == 0) {
      Toast.fail('请重新上传身份证国徽面照片');
      return false;
    }
    if (name != idcardA.cardInfo.姓名.words) {
      Toast.fail('请检查姓名是否正确');
      return false;
    }
    if (parseInt(idcard) != parseInt(idcardA.cardInfo.公民身份号码.words)) {
      Toast.fail('请检查身份证号是否正确');
      return false;
    }
    if (idcardB.cardInfo.失效日期.words != '长期') {
      if (parseInt(time) >= parseInt(idcardB.cardInfo.失效日期.words)) {
        Toast.fail('身份证过期，请上传最新身份证');
        return false;
      }
    }
    return true;
  },
  //弹出选择提示框
  showPopup(e) {
    const that = this;
    const type = e.currentTarget.dataset.type;
    that.setData({
      show: true,
      cardType: type
    });
    if (type == 3) {
      that.setData({
        rotate: false,
      });
    } else {
      that.setData({
        rotate: true,
      });
    }
  },
  //关闭选择提示框
  onClose() {
    this.setData({
      show: false
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
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album'],
        success(res) {
          that.submitImgUpload(that.data.cardType, res.tempFilePaths[0]);
        }
      })
    }
  },
  //监听拍照
  takePhotos(e) {
    const that = this;
    that.setData({
      captureHidden: true,
      back: 0,
    });
    console.log(e.detail.imgPath);
    that.submitImgUpload(e.detail.cardType, e.detail.imgPath);
  },
  //提交图片上传
  submitImgUpload(type, imgPath) {
    const that = this;
    wx.showLoading({
      title: '上传中...',
      mask: true
    })
    //return false;
    if (type == 1) {
      that.upLoadImg('clientFile', imgPath, 1).then((data) => {
        that.setData({
          img1: 1,
          fileLista: imgPath
        });
        wx.hideLoading();
        app.globalData.idcardA = data.datas;
        wx.setStorageSync('idcardA', data.datas);
      }).catch((error) => {
        that.setData({
          img1: 0,
        });
        wx.hideLoading();
        Toast.fail('请重新上传身份证人像面照片');
      });
    } else if (type == 2) {
      that.upLoadImg('clientFile', imgPath, 2).then((data) => {
        that.setData({
          img2: 1,
          fileListb: imgPath
        });
        wx.hideLoading();
        app.globalData.idcardB = data.datas;
        wx.setStorageSync('idcardB', data.datas);
      }).catch((error) => {
        that.setData({
          img2: 0,
        });
        wx.hideLoading();
        Toast.fail('请重新上传身份证国徽面照片');
      });
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
  //图片上传
  upLoadImg(fileName, clientFile, type) {
    const that = this;
    const url = baseUrl + '/api/uploadFileSas'
    let param = {
      fileName: new Date().getTime() + '_' + wx.getStorageSync('mobile'),
      fechType: 1,
      type: type
    };
    console.log('pam', param);
    return new Promise(function (resolve, reject) {
      FILE(url, fileName, clientFile, param)
        .then((res) => {
          console.log('上传成功', res);
          if (res.code == 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch((error) => {
          console.log('上传失败', error);
          reject(error);
        });
    });
  },
  //人脸比对
  faceComparisonSas() {
    const that = this;
    that.setData({
      showT: true
    });
    let url = baseUrl + '/api/faceComparisonSas';
    let params = {
      picnamez: app.globalData.idcardA.picnamez,
      picnamehand: app.globalData.handCard.picnamehand
    }
    POST(url, params).then(function (res, jet) {
      that.setData({
        showT: false
      });
      if (res.code == 200) {
        that.creatOrder();
      } else {
        Toast.fail(res.msg);
      }
    });
  },
  //根据号卡类型跳转判断
  creatOrder() {
    let numberOperType = parseInt(wx.getStorageSync('numberOperType'));
    if (numberOperType == '0' || numberOperType == '1') {
      //0：白卡/普通卡;1：大语音卡
      wx.reLaunch({
        url: '/registion/pages/handcard/handcard'
      })
    } else if (numberOperType == '2') {
      //2：小号/无实体卡;
      wx.navigateTo({
        url: '/registion/pages/bioassay/bioassay'
      })
    }
  },
  //点击下一步操作
  nextStep() {
    const that = this;
    if (app.globalData.isBioass) {
      wx.reLaunch({
        url: '/registion/pages/handcard/handcard'
      })
    } else {
      if (that.verifyIdCarda()) {
        that.creatOrder();
      }
    }
  },
  //监听返回按钮
  goBack() {
    const that = this;
    if (that.data.back == 0) {
      wx.redirectTo({
        url: '/registion/pages/number/number'
      })
    } else {
      that.setData({
        captureHidden: true,
        back: 0,
      });
    }
  },
})