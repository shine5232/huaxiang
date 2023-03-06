import {
  formatTime,
  formatDatesYmd,
  baseUrl,
  CanvasToImage,
  baseUrlP
} from '../../../utils/util'
import {
  FILE,
  POST,
  GET
} from '../../../utils/promise'
var app = getApp();

Page({
  data: {
    type: 1,
    active: 2,
    overlay: true,
    datetime: formatDatesYmd(new Date()),
    signed: false,
    sign: '',
    nextStepTitle: '添加签名',
    showText: false,
    disabled: true,
    canvasWidth: 0,
    canvasHeight: 0,
    width: '',
    height: '',
    hide: true,
    checked: false,
    myCanvas1_canvas: '',
    myCanvas1_ctx: '',
    fileId: '', //签名照id
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
    back: 0,
    isDraw: false,
    signImg: '',
    fileSystemManager: {},
  },
  onLoad() {
    const that = this;
    let fileSystemManager = wx.getFileSystemManager();
    that.setData({
      type: app.globalData.steps,
      width: app.globalData.windowWidth,
      height: app.globalData.windowHeight,
      canvasWidth: app.globalData.windowWidth,
      canvasHeight: app.globalData.windowHeight,
      datetime: formatDatesYmd(new Date()),
      fileSystemManager: fileSystemManager
    })
  },
  onReady() {
    let that = this;
    let query = wx.createSelectorQuery();
    setTimeout(function () {
      query.select('#myCanvas1').fields({
        node: true,
        size: true
      }).exec(function (res) {
        let canvas1 = res[0].node
        let ctx1 = canvas1.getContext('2d')
        canvas1.width = 375
        canvas1.height = 1365
        that.setData({
          myCanvas1_canvas: canvas1,
          myCanvas1_ctx: ctx1,
        });
      });
    }, 300);
  },
  onShow() {
    const that = this;
    if (that.data.sign) {
      that.setData({
        nextStepTitle: '下一步'
      });
    }
  },
  eventListener(e) {
    if (e.detail) {
      this.setData({
        disabled: false,
      });
    }
  },

  /**
   * @param ctx 2d上下文对象
   * @param text 绘制文本
   * @param x 坐标轴x位置
   * @param y 坐标轴y位置
   * @param options 包含 maxWidth 最大宽度，lineHeight 文字行高，row 限制行数，textIndent 首行缩进，fontSize 文字大小
   */
  textEllipsis(ctx, text, x, y, options) {
    if (typeof text !== 'string' || typeof x !== 'number' || typeof y !== 'number') {
      return;
    }
    let defaultOpt = {
      maxWidth: 375 / 1.14,
      lineHeight: 24,
      row: 1000,
      textIndent: 24,
      fontSize: 12
    };
    let params = Object.assign({}, defaultOpt, options);
    // 分割文本
    let textArr = text.split('');
    // 文本最终占据高度
    let textHeight = 0;
    // 每行显示的文字
    let textOfLine = '';
    // 控制行数
    let limitRow = params.row;
    let rowCount = 0;
    // 循环分割的文字数组
    for (let i = 0; i < textArr.length; i++) {
      // 获取单个文字或字符
      let singleWord = textArr[i];
      // 连接文字
      let connectText = textOfLine + singleWord;
      // 计算接下来要写的是否是最后一行
      let isLimitRow = limitRow ? rowCount === (limitRow - 1) : false;
      // 最后一行则显示省略符,否则显示连接文字
      let measureText = isLimitRow ? (connectText + '...') : connectText;
      // 设置字体并计算宽度,判断是否存在首行缩进
      ctx.font = `${params.fontSize}px "MicroSoft YaHei"`;
      let width = ctx.measureText(measureText).width;
      // 首行需要缩进满足条件
      let conditionIndent = (params.textIndent && rowCount === 0);
      let measureWidth = conditionIndent ? (width + params.textIndent) : width;
      // 大于限制宽度且已绘行数不是最后一行，则写文字
      if (measureWidth > params.maxWidth && i > 0 && rowCount !== limitRow) {
        // 如果是最后一行，显示计算文本
        let canvasText = isLimitRow ? measureText : textOfLine;
        let xPos = conditionIndent ? (x + params.textIndent) : x;
        // 写文字
        ctx.fillText(canvasText, xPos, y);
        // 下一行文字
        textOfLine = singleWord;
        // 记录下一行位置
        y += params.lineHeight;
        // 计算文本高度
        textHeight += params.lineHeight;
        rowCount++;

        if (isLimitRow) {
          break;
        }
      } else {
        // 不大于最大宽度
        textOfLine = connectText;
      }
    }
    if (rowCount !== limitRow) {
      let xPos = (params.textIndent && rowCount === 0) ? (x + params.textIndent) : x;
      ctx.fillText(textOfLine, xPos, y);
    }
    // 计算文字总高度
    let textHeightVal = rowCount < limitRow ? (textHeight + params.lineHeight) : textHeight;
    return textHeightVal;
  },
  //绘制签名告知书
  drawNote() {
    let that = this;
    that.composeImg().then((res) => {
      return that.submitOrder();
    }).then((res) => {
      return that.recordLoginInfo();
    }).then((res) => {
      if (that.data.type == 1) { //结束
        wx.reLaunch({
          url: '/pages/complete/complete?title=激活&from=act_complete&note=恭喜您！号卡激活成功'
        })
      } else { //预付款页面
        wx.reLaunch({
          url: '/pages/prepay/prepay'
        })
      }
    }).catch((error) => {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: error
      });
    });
  },
  //合成协议书
  composeImg() {
    let that = this;
    let url = baseUrl + '/api/urlConvertPdf';
    let idcardA = wx.getStorageSync('idcardA');
    let parms = {
      userSign: that.data.fileId,
      userSignTime: that.data.datetime,
      userName: idcardA.cardInfo.姓名.words,
      type: ''
    }
    console.log('parms', parms);
    return new Promise((resolve, reject) => {
      POST(url, parms, 1).then(function (res, jet) {
        if (res.code == 200) {
          app.globalData.signImg = res.datas.opId
          resolve();
        } else {
          reject(res.msg);
        }
      }).catch(() => {
        reject('请求失败，请稍后再试');
      });
    });
  },
  //生成协议图片1
  drawNote1() {
    let that = this;
    let ctx = that.data.myCanvas1_ctx;
    let canvas = that.data.myCanvas1_canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    return new Promise((resolve, reject) => {
      ctx.fillStyle = "#FFFFFF";
      ctx.restore();
      ctx.fillStyle = "#000000";
      ctx.font = 'normal bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('电话卡合规使用告知书', 375 / 2, 50);
      ctx.textAlign = 'left';
      that.textEllipsis(ctx, '为配合国家涉诈电话卡防范治理工作，特向华翔电话卡用户告知相关规定如下：', 20, 80);
      that.textEllipsis(ctx, '凡华翔电话卡用户不得将电话卡违规转售、转租、转借第三方，否则我司有权解除合同、终止服务，并移交司法部门处置。', 20, 130);
      that.textEllipsis(ctx, '按照《中华人民共和国刑法修正案（九）》第二百八十七条之二，明知他人利用信息网络实施犯罪，为其犯罪提供互联网接入、服务器托管、网络存储、通讯传输等技术支持，或者提供广告推广、支付结算等帮助，情节严重的，将处三年以下有期徒刑或者拘役，并处或者单处罚金。', 20, 200);
      that.textEllipsis(ctx, '本人已清楚了解告知书所提示内容，本人愿意遵守国家法规并承担相应法律责任。', 20, 320);
      ctx.font = 'normal bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('电信业务入网协议书', 375 / 2, 380);
      ctx.textAlign = 'left';
      that.textEllipsis(ctx, '甲方：', 20, 410);
      that.textEllipsis(ctx, '乙方：北京华翔联信科技有限公司', 20, 440);
      that.textEllipsis(ctx, '根据《中华人民共和国合同法》《中华人民共和国电信条例》等有关法律法规的规定，甲乙双方在平等、自愿、公平、诚信的基础上，基于对乙方产品服务的了解和需求，甲方自愿申请成为乙方客户，并达成协议如下：', 20, 470);
      that.textEllipsis(ctx, '第一条 实名注册及业务办理', 20, 570);
      that.textEllipsis(ctx, '（一）根据《电话用户真实身份信息登记实施规范》要求，甲方办理实名注册、变更手续时，应提交以下登记资料：', 20, 595);
      that.textEllipsis(ctx, '1、个人客户：提供个人有效身份证件原件。委托他人经办的，应同时提交本人及受托人有效身份证件原件。针对未满16周岁及其他无民事行为能力的用户，应由其法定代理人提交本人及法定代理人有效身份证件原件。有效身份证件包括如下：', 20, 645);
      that.textEllipsis(ctx, '1）居住在中国境内的中国公民，应出具居民身份证、临时居民身份证或户口簿；', 20, 770);
      that.textEllipsis(ctx, '2）中国人民解放军军人，中国人民武装警察办理用于个人或社会活动的电话号码，应出具居民身份证；办理用于执行公务、办理公务的电话号码，应出具军官证、士兵证、警官证等军队、武装警察部队制发的身份证件，并同时出具单位相关证明文件；', 20, 820);
      that.textEllipsis(ctx, '3）中国香港、中国澳门居民，应出具港澳居民往来内地通行证或者其他有效旅行证件；中国台湾居民，应出具台湾居民来往大陆通行证或者其他有效旅行证件；', 20, 945);
      that.textEllipsis(ctx, '4）外国公民，应出具护照或外国人永久居留身份证；', 20, 1020);
      that.textEllipsis(ctx, '2、单位客户：提供单位授权书、营业执照副本原件或组织机构代码证原件（三证合一）、经办人有效身份证件原件等。事业单位提供事业单位法人证书或社会团体法人登记证书、经办人有效身份证件原件等。除此之外，单位客户还应提供实际使用人有效身份证件。', 20, 1045);
      that.textEllipsis(ctx, '（二）根据《电话用户真实身份信息登记实施规范》要求，乙方要现场拍摄并留存办理人/受托人/法定代理人/经办人照片。', 20, 1170);
      that.textEllipsis(ctx, '（三）甲方应使用国家给予入网许可标志的终端设备，终端设备应具备支持所选服务的相应功能，如无法支持所选服务，甲方应自行承担后果，并向乙方全额支付其所选服务的全部费用。', 20, 1245);
      wx.canvasToTempFilePath({
        canvasId: 'firstCanvas',
        fileType: 'jpg',
        canvas: canvas,
        quality: 1, //图片质量
        success(res) {
          that.data.fileSystemManager.readFile({
            filePath: res.tempFilePath,
            encoding: 'base64',
            success(res) {

              that.setData({
                signImg: res.data
              })
              /* let signImg = "signImg[0]"
              that.setData({
                [signImg]: 'data:image/jpeg;base64,' + res.data
              }) */
              resolve(true);
            },
            fail(error) {
              reject('请求失败，请稍后再试');
            }
          });
          return false;
          let url = baseUrl + '/api/uploadFileSas';
          //let url = 'https://laravel.harus.icu/api/upload/vioceFile';
          let name = 'clientFile';
          let param = {
            fileName: new Date().getTime() + '_1_' + app.globalData.mobile,
            fechType: 1,
            type: 3
          };
          FILE(url, name, res.tempFilePath, param, false).then(function (res, jec1) {
            console.log('res1', res);
            if (res.code == 200) {
              let signImg = "signImg[0]"
              that.setData({
                [signImg]: res.datas.picnamehand
              })
              resolve(true);
            } else {
              reject('请求失败，请稍后再试');
            }
          }).catch((error) => {
            reject('请求失败，请稍后再试');
          });
        },
        fail(res) {
          reject('请求失败，请稍后再试');
        }
      });
    });
  },
  //监听协议勾选
  onChange(e) {
    this.setData({
      checked: e.detail
    });
  },
  //点击下一步操作
  nextStep(e) {
    const that = this;
    if (!that.data.disabled) {
      if (that.data.isDraw) { //已经签名了
        that.drawNote();
      } else {
        wx.navigateTo({
          url: '/active/pages/sign/sign'
        });
      }
    } else {
      wx.showToast({
        icon: 'none',
        mask: true,
        title: '请先阅读完上述告知书后再签名'
      });
    }
  },
  //提交订单
  submitOrder() {
    const that = this;
    let url = baseUrl + '/api/user/submitOrderReservationPay';
    let parms = {
      orderId: app.globalData.orderId,
      piclivebest: app.globalData.piclivebest,
      piclivestdA: app.globalData.opIds[0],
      piclivestdB: app.globalData.opIds[1],
      accessprotocol: app.globalData.signImg
    }
    return new Promise((resolve, reject) => {
      POST(url, parms, true).then(function (res, jet) {
        if (res.code == 200) {
          resolve();
        } else {
          reject(res.msg);
        }
      }).catch(() => {
        reject('请求失败，请稍后再试');
      });
    });
  },
  //判断订单状态
  getOrderInfo() {
    let that = this;
    return new Promise((resolve, reject) => {
      let url = baseUrl + '/api/order/getOrderInfo';
      let parms = {
        orderId: app.globalData.orderId
      }
      POST(url, parms, true).then(function (res, jet) {
        if (res.code == 200) {
          let datas = res.datas;
          if (datas.orderStatus == 13) {
            wx.navigateTo({
              url: '/pages/prepay/prepay'
            })
          } else {
            wx.reLaunch({
              url: '/pages/complete/complete?title=激活&from=act_complete&note=恭喜您！号卡激活成功'
            })
          }
        } else {
          wx.showToast({
            icon: 'none',
            mask: true,
            title: res.msg,
            duration: 2000
          });
        }
      });
    });
  },
  //记录登录日志
  recordLoginInfo() {
    let url = baseUrlP + '/app/login/recordLoginInfo';
    let mobile = wx.getStorageSync('mobile');
    let deviceId = wx.getStorageSync('deviceId');
    let deviceType = wx.getStorageSync('deviceType');
    let osVersion = wx.getStorageSync('osVersion');
    let netWorkType = wx.getStorageSync('netWorkType');
    let location = wx.getStorageSync('location');
    let parms = {
      fromType: 'OpenUser',
      osType: 'XCX',
      serviceNum: mobile,
      longitude: location.location.lng,
      latitude: location.location.lat,
      areaText: location.address,
      countryCode: location.ad_info.nation_code,
      adCode: location.ad_info.adcode,
      cityCode: location.ad_info.city_code,
      deviceId: deviceId,
      deviceType: deviceType,
      osVersion: osVersion + '|XCX_V:' + app.globalData.version,
      netWorkType: netWorkType,
    }
    console.log('recordLoginInfo', parms);
    return new Promise(function (resolve, reject) {
      POST(url, parms).then(function (res, jet) {
        resolve(true);
      });
    });
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
        signed: false,
        back: 0,
      });
    }
  },
})