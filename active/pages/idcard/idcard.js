import {
  baseUrl,
  formatDates,
  watermark
} from '../../../utils/util'
import {
  FILE,
  POST
} from '../../../utils/promise'
var app = getApp();
Page({
  data: {
    type: 1,
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
    img1: 0,
    img2: 0,
    img3: 0,
    isBioass: true,
    title: '下一步，手持验证',
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
      type: app.globalData.steps,
      isBioass: !app.globalData.isBioass,
      title: app.globalData.isBioass ? '下一步' : '下一步，手持验证',
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
  //验证照片是否上传
  verifyIdCarda() {
    const that = this;
    let idcardB = wx.getStorageSync('idcardB');
    let time = formatDates(new Date());
    if (that.data.mobile == '') {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请输入紧急联系电话'
      });
      return false;
    } else {
      if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(that.data.mobile)) {
        wx.showToast({
          icon:'none',
          mask:true,
          title:'联系电话格式不正确'
        });
        return false;
      }
    }
    if (that.data.fileLista == '') {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请上传身份证人像面照片'
      });
      return false;
    }
    if (that.data.fileListb == '') {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请上传身份证国徽面照片'
      });
      return false;
    }
    if (that.data.fileListc == '') {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请上传本人的免冠照片'
      });
      return false;
    }
    if (that.data.img1 == 0) {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请重新上传身份证人像面照片'
      });
      return false;
    }
    if (that.data.img2 == 0) {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请重新上传身份证国徽面照片'
      });
      return false;
    }
    if (that.data.img3 == 0) {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请重新上传本人的免冠照片'
      });
      return false;
    }
    if (idcardB.cardInfo.失效日期.words != '长期') {
      if (parseInt(time) >= parseInt(idcardB.cardInfo.失效日期.words)) {
        wx.showToast({
          icon:'none',
          mask:true,
          title:'身份证过期，请上传最新身份证'
        });
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
      captureHidden: true,
      back: 0,
    });
    that.submitImgUpload(e.detail.cardType, e.detail.imgPath);
  },
  //提交图片上传
  submitImgUpload(type, imgPath) {
    const that = this;
    if (type == 1) {
      that.upLoadImg('clientFile', imgPath, 1).then((data) => {
        that.setData({
          img1: 1
        });
        that.setData({
          fileLista: imgPath
        });
        wx.setStorageSync('idcardA', data.datas);
      }).catch((error) => {
        that.setData({
          img1: 0
        });
      });
    } else if (type == 2) {
      that.upLoadImg('clientFile', imgPath, 2).then((data) => {
        that.setData({
          img2: 1
        });
        wx.setStorageSync('idcardB', data.datas);
        that.setData({
          fileListb: imgPath
        });
      }).catch((error) => {
        that.setData({
          img2: 0
        });
      });
    } else {
      that.upLoadImg('clientFile', imgPath, 3).then((data) => {
        that.setData({
          img3: 1
        });
        wx.setStorageSync('handCard', data.datas);
        that.setData({
          fileListc: imgPath
        });
      }).catch((error) => {
        that.setData({
          img3: 0
        });
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
    //const url = 'https://laravel.harus.icu/api/upload/vioceFile';
    let param = {
      fileName: new Date().getTime() + '_' + app.globalData.mobile,
      fechType: 1,
      type: type
    };
    console.log('pam', param);
    return new Promise(function (resolve, reject) {
      FILE(url, fileName, clientFile, param,1,1)
        .then((res) => {
          if (res.code == 200) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  //人脸比对
  faceComparisonSas() {
    const that = this;
    let url = baseUrl + '/api/faceComparisonSas';
    let idcardA = wx.getStorageSync('idcardA');
    let handCard = wx.getStorageSync('handCard');
    let params = {
      picnamez: idcardA.picnamez,
      picnamehand: handCard.picnamehand
    }
    POST(url, params,1).then(function (res, jet) {
      if (res.code == 200) {
        that.faceVerify();
      } else {
        wx.showToast({
          icon:'none',
          mask:true,
          title:res.msg
        });
      }
    });
  },
  //在线活体
  faceVerify() {
    const that = this;
    let url = baseUrl + '/api/faceVerify';
    let handCard = wx.getStorageSync('handCard');
    let parms = {
      opIds: [handCard.picnamehand],
      svcNumber: app.globalData.mobile
    }
    console.log('faceVerify', parms);
    POST(url, parms).then(function (res, jet) {
      if (res.code == 200) {
        that.creatOrder();
      } else {
        wx.showToast({
          icon:'none',
          mask:true,
          title:res.msg
        });
      }
    });
  },
  //创建预约订单
  creatOrder() {
    const that = this
    let url = baseUrl + '/api/user/openUserReservation';
    let idcardA = wx.getStorageSync('idcardA');
    let idcardB = wx.getStorageSync('idcardB');
    let handCard = wx.getStorageSync('handCard');
    let numberOperType = parseInt(wx.getStorageSync('numberOperType'));
    let params = {
      svcNumber: app.globalData.mobile,
      iccid: app.globalData.iccid,
      fechType: 1,
      orderSubType: 44,
      linkPhone: that.data.mobile,
      picnamez: idcardA.picnamez,
      picnamef: idcardB.picnamef,
      picnamehand: handCard.picnamehand,
      custcertno: idcardA.cardInfo.公民身份号码.words,
      custname: idcardA.cardInfo.姓名.words,
      gender: idcardA.cardInfo.性别.words,
      nation: idcardA.cardInfo.民族.words,
      birthdayDate: idcardA.cardInfo.出生.words,
      address: idcardA.cardInfo.住址.words,
      issuingauthority: idcardB.cardInfo.签发机关.words,
      certvalidDate: idcardB.cardInfo.签发日期.words,
      certexpDate: idcardB.cardInfo.失效日期.words == '长期' ? '20991231' : idcardB.cardInfo.失效日期.words,
    }
    POST(url, params,1).then(function (res, jet) {
      if (res.code == 200) {
        app.globalData.orderId = res.datas.orderId;
        if (numberOperType == '0' || numberOperType == '1') {
          wx.reLaunch({
            url: '/active/pages/handcard/handcard'
          })
        }
        if (numberOperType == '2') {
          wx.navigateTo({
            url: '/active/pages/bioassay/bioassay'
          })
        }
      } else {
        wx.showToast({
          icon:'none',
          mask:true,
          title:res.msg
        });
      }
    });
  },
  //点击下一步操作
  nextStep() {
    const that = this;
    if (app.globalData.isBioass) {
      wx.reLaunch({
        url: '/active/pages/handcard/handcard'
      })
    } else {
      if (that.verifyIdCarda()) {
        that.faceComparisonSas();
      }
    }
  },
  //监听返回按钮
  goBack() {
    const that = this;
    if (that.data.back == 0) {
      wx.redirectTo({
        url: '/active/pages/number/number'
      })
    } else {
      that.setData({
        captureHidden: true,
        back: 0,
      });
    }
  },
})