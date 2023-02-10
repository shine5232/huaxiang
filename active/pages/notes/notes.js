import {
  formatTime,
  baseUrl,
  CanvasToImage,
  baseUrlP
} from '../../../utils/util'
import {
  FILE,
  POST
} from '../../../utils/promise'
var app = getApp();

Page({
  data: {
    type: 1,
    active: 2,
    overlay: true,
    datetime: formatTime(new Date()),
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
      datetime: formatTime(new Date()),
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
    let url = baseUrl + '/api/uploadImg';
    let parms = {
      imgId: that.data.fileId,
    }
    console.log('parms', parms);
    return false;
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
  //生成协议图片2
  drawNote2() {
    let that = this;
    let ctx = that.data.myCanvas1_ctx;
    let canvas = that.data.myCanvas1_canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    return new Promise(function (resolve, reject) {
      ctx.fillStyle = "#FFFFFF";
      ctx.restore();
      ctx.fillStyle = "#000000";
      ctx.textAlign = 'left';
      that.textEllipsis(ctx, '（四）甲方欲将名下业务号码过户时（有约定不可过户的号码除外），应先缴清所有费用，过户时须由双方持有效身份证件原件办理。如有特殊情况，甲方可委托他人办理，但应同时提交本人及经办人有效身份证件原件。在甲方通过过户成为新机主的情形下，如因原机主未亲自到场办理过户而导致原机主就此提出异议，甲方应无条件放弃因过户产生的全部权益，并承担由此对原机主及对乙方造成的一切损失。过户经办人对此承担连带责任。', 20, 50);
      that.textEllipsis(ctx, '（五）一证一号原则。个人客户凭借本人身份证件原件办理号码开户，且只可以办理一个号码。', 20, 250);
      that.textEllipsis(ctx, '（六）个人用户持居民身份证在网络渠道办理入网手续时，自收到未激活的移动电话卡日期起，需在30天内进行有效激活，超期未激活的，乙方有权回收卡号。', 20, 300);
      that.textEllipsis(ctx, '第二条 费用标准和费用缴纳', 20, 375);
      that.textEllipsis(ctx, '（一）乙方应在国家电信资费主管部门允许的范围内设定资费标准、向客户明码标价、公告缴费期限信息；甲方应在乙方明示的期限内足额缴纳各项费用。', 20, 400);
      that.textEllipsis(ctx, '（二）甲方使用乙方提供的产品及服务方案，有效期按约定执行。产品及服务到期后，双方如无异议，有效期逐年自动顺延。如无特殊约定，甲方在有效期内或到期后可更换。', 20, 475);
      that.textEllipsis(ctx, '（三）如遇国家统一调整通信费用标准的，则按国家统一规定执行。如遇乙方发布、调整资费的，自乙方公告确定的生效日起开始执行新的资费标准。在乙方公告确定的生效日前，甲方未提出异议的视为同意，协议继续履行；甲方提出异议且未能与乙方达成一致的，甲方向乙方结清全部未付款项后本协议自动终止。', 20, 550);
      that.textEllipsis(ctx, '（四）计费周期为自然月。由于客户跨计费周期使用乙方产品服务，网络设备产生话单及相关处理会有时延，可能会发生当月部分费用计入后期费用中收取的情况。', 20, 700);
      that.textEllipsis(ctx, '（五）甲方应按时缴纳相关费用。甲方未及时缴纳相关费用的，形成欠费，按照《电信服务规范》，乙方有权暂停甲方服务，并可以按照所欠费用自停机次日起每日加收3‰（千分之三）的违约金。自欠费停机之日起30天内，如甲方交清欠费和违约金的，乙方应在甲方交清欠费和违约金后的48小时内恢复暂停的服务。凡停机超过30天的号码即可进行销户回收，在号码销户回收满90天后，重新进行销售。在号码销户的90天内，若被销户号码原用户要求再使用该号码，则需支付50元销户重开费用（含卡费、快递费及相关人工费用等）；在号码销户90天后，如果号码已经卖给别人，则原用户无法再使用该号码。若号码没有被卖出，则原用户在支付50元销户重开费用后，必须按新开户号码流程办理，重新入网。对前述情形，乙方将保留追缴欠费及向征信机构提供甲方欠费信息的权利，也可用通知单、委托第三方等形式追缴欠费。', 20, 775);
      that.textEllipsis(ctx, '（六）甲方自愿定制第三方产品或其它收费业务，乙方可以代第三方向甲方收取信息费、功能费等，甲方使用第三方提供的产品或其它收费业务由第三方制定收费标准并公布。', 20, 1110);
      that.textEllipsis(ctx, '（七）因甲方终端中的软件自动升级等原因产生的网络流量，甲方应承担该笔流量所产生的费用。', 20, 1185);
      that.textEllipsis(ctx, '第三条 优惠活动', 20, 1235);
      that.textEllipsis(ctx, '优惠活动是指乙方通过包括但不限于“话费优惠（存费送费、购机送费）、终端优惠（存费送机）、赠送产品与礼品、折扣销售“等方式向符合条件的甲方提供各类优惠产品与服务的活动。', 20, 1260);
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

              let signImg = that.data.signImg;
              that.setData({
                signImg: signImg + 'data:image/jpeg;base64,' + res.data
              })
              /* let signImg = "signImg[1]"
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
            fileName: new Date().getTime() + '_2_' + app.globalData.mobile,
            fechType: 1,
            type: 3
          };
          FILE(url, name, res.tempFilePath, param, false).then(function (res, jec1) {
            console.log('res2', res);
            if (res.code == 200) {
              let signImg = "signImg[1]"
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
  //生成协议图片3
  drawNote3() {
    let that = this;
    let ctx = that.data.myCanvas1_ctx;
    let canvas = that.data.myCanvas1_canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    return new Promise(function (resolve, reject) {
      ctx.fillStyle = "#FFFFFF";
      ctx.restore();
      ctx.fillStyle = "#000000";
      ctx.textAlign = 'left';
      that.textEllipsis(ctx, '在符合条件的情况下、甲方可自愿参加乙方的优惠活动。', 20, 50); //2605
      that.textEllipsis(ctx, '优惠活动会有一定的时间、人数、条件等限制，并非所有甲方都有资格参加。优惠活动的详情以乙方不定时发布的优惠活动通知为准。', 20, 75);
      that.textEllipsis(ctx, '甲方根据本协议购买并使用乙方的产品，在符合优惠活动的各种条件并且甲方自愿表示要参与此次优惠活动的前提下，可以与乙方达成一致，签署相关协议，并参加乙方提供的优惠活动。', 20, 150);
      that.textEllipsis(ctx, '第四条 客户权益', 20, 250);
      that.textEllipsis(ctx, '（一）通信服务', 20, 275);
      that.textEllipsis(ctx, '1、乙方通过租用基础运营商的网络向甲方提供通信服务，乙方在所租用的基础运营商的网络覆盖范围内向甲方提供通信服务。', 20, 300);
      that.textEllipsis(ctx, '2、乙方租用的基础运营商网络通信服务应符合国家规定的通信质量标准。', 20, 375);
      that.textEllipsis(ctx, '（二）客户服务', 20, 425);
      that.textEllipsis(ctx, '1、乙方在租用的基础运营商网络覆盖范围内按照不低于《电信服务规范》的标准向客户提供服务。', 20, 450);
      that.textEllipsis(ctx, '2、乙方向甲方提供网站、大客户经理、客户服务热线10036 、微信等服务渠道，便于甲方了解乙方各项服务。乙方还应向甲方免费提供通话所在地（仅限国内不含港澳台）火警119、匪警110、医疗急救120、交通事故报警122等公益性电信服务。', 20, 500);
      that.textEllipsis(ctx, '3、乙方向甲方提供需要甲方支付月功能费的产品服务时，应征得甲方同意；乙方开通产品服务让甲方进行体验时，不应收取体验产品服务月功能费。', 20, 625);
      that.textEllipsis(ctx, '4、对于甲方产品服务开通/关闭申请，乙方应在承诺的时限内操作完成（双方另有约定的除外）。乙方超过时限未及时开通/关闭的，应减免甲方由此产生的费用。', 20, 700);
      that.textEllipsis(ctx, '5、为向甲方提供更好的服务，方便甲方了解乙方各类产品和服务信息，乙方可通过短信、微信、电子邮件、信函等方式与甲方就产品和服务进行沟通。', 20, 775);
      that.textEllipsis(ctx, '6、乙方依法保证甲方的信息资料安全、通信自由和通信秘密，但法律法规另行规定的除外。', 20, 850);
      that.textEllipsis(ctx, '第五条 风险与责任', 20, 900);
      that.textEllipsis(ctx, '（一）甲方应保证注册、变更登记资料真实有效、准确完整，并有义务配合乙方对登记资料进行查验。甲方登记资料如有变更，应主动办理变更手续。因甲方提供的客户资料不详、不实或变更后未及时通知乙方等原因，使乙方无法向甲方提供产品服务或甲方无法享受到乙方提供的相关产品服务，乙方无需向甲方承担任何责任。如乙方发现因甲方登记资料失实或者甲方未配合及时更正影响协议正常履行的，乙方有权暂停甲方产品服务，且乙方无需向甲方承担任何责任。', 20, 925);
      that.textEllipsis(ctx, '（二）甲方应妥善保管自己的电话号码、通信卡等，若发现丢失或被盗用，可及时拨打客户服务电话或联系大客户业务经理办理挂失或修改服务密码手续；并可向公安机关报案，乙方应配合公安机关调查，但乙方不承担上述情形对甲方所造成的损失及后果；如甲方将名下号码（产品）交予他人使用，因此引起的义务与责任仍由甲方承担。', 20, 1125);
      that.textEllipsis(ctx, '（三）甲方应妥善管理其服务密码。服务密码是甲方办理业务的重要凭证，甲方入网后应立即修改初始服务密码。凡使用服务密码定制、变更或终止业务的行为均被视为甲方或甲方授权的行为，因此引起的义务与责任均由甲方承担。', 20, 1275);
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

              let signImg = that.data.signImg;
              that.setData({
                signImg: signImg + 'data:image/jpeg;base64,' + res.data
              })
              /* let signImg = "signImg[2]"
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
            fileName: new Date().getTime() + '_3_' + app.globalData.mobile,
            fechType: 1,
            type: 3
          };
          FILE(url, name, res.tempFilePath, param, false).then(function (res, jec1) {
            console.log('res3', res);
            if (res.code == 200) {
              let signImg = "signImg[2]"
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
  //生成协议图片4
  drawNote4() {
    let that = this;
    let ctx = that.data.myCanvas1_ctx;
    let canvas = that.data.myCanvas1_canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    return new Promise(function (resolve, reject) {
      ctx.fillStyle = "#FFFFFF";
      ctx.restore();
      ctx.fillStyle = "#000000";
      ctx.textAlign = 'left';
      that.textEllipsis(ctx, '（四）甲方在欠费情况下，乙方有权拒绝为甲方开办其他业务并停止甲方所有网络和产品服务，直至甲方在规定的期限内补缴全部欠费，方可复机。超出缴费期限，按照相关规定处理。', 20, 50); //3930
      that.textEllipsis(ctx, '（五）甲方所办理的数据业务下行速率标称值仅为乙方提供的数据业务下行速率最高值，乙方不能保证在任何情况下均能达到前述标称值，甲方对此表示知悉并认可。', 20, 150);
      that.textEllipsis(ctx, '（六）甲方未付的费用达到信用额度时（信用额度是指客户可以用于透支消费的最高费用额度），应及时补充缴纳相关费用；当甲方未付的费用超过信用额度时，乙方有权暂停甲方网络和其他产品服务，超过信用额度停机同样受约定缴费期限的限制。', 20, 225);
      that.textEllipsis(ctx, '（七）甲方发送违法及其他违反公序良俗内容的信息，或未经接收客户同意大量发送商业广告信息的，乙方有权依据接收客户举报或投诉关闭甲方信息发送通道和功能。', 20, 350);
      that.textEllipsis(ctx, '（八）甲方利用移动号码进行诈骗电话等违法或其它违反公序良俗的活动，或未经接收客户同意大量发送语音广告信息等骚扰电话的，乙方有权依据接收客户举报或投诉，或者监管部门的通报对涉事号码进行停机处理。', 20, 425);
      that.textEllipsis(ctx, '（九）因甲方原因造成的通信卡密码丢失、锁卡或被他人获取造成的损失，乙方不承担责任，甲方不能以此为由拒绝按本协议约定支付费用。', 20, 525);
      that.textEllipsis(ctx, '（十）按照公平使用原则，乙方将对甲方名下每个号码的移动上网数据流量进行封顶限制，甲方名下每个号码每月的移动上网数据流量达到或超出流量封顶额度时，乙方可暂停甲方该号码当月的上网服务，次月自动恢复开通。', 20, 600);
      that.textEllipsis(ctx, '第六条 隐私和通信权益保护', 20, 700);
      that.textEllipsis(ctx, '（一）甲方的通信自由和通信秘密不受侵犯，乙方对甲方的客户资料和通信信息负有保密义务。但根据法律行政法规规定，司法、行政机关依法要求乙方提供协助和配合，乙方应给予协助和配合的，不构成违反保密义务。', 20, 725);
      that.textEllipsis(ctx, '（二）甲方个人信息是指以电子或者其他方式记录的能够单独或者与其他信息结合识别甲方身份或者反映甲方活动情况的各种信息。乙方收集、使用甲方用户个人信息，应当遵循合法、正当、必要的原则。', 20, 825);
      that.textEllipsis(ctx, '（三）甲方理解并同意，乙方及其关联公司可以通过业务受理系统登记、纸质返档，通过网络接收、读取并记录等方式，以提供电信服务为目的，在业务活动中收集、使用甲方提供的和甲方使用服务过程中形成的个人信息。乙方有权依法对包含甲方在内的整体用户数据进行分析并加以利用。未经甲方同意，乙方不向除乙方关联公司外的第三方提供甲方个人信息。甲方可以通过营业厅或乙方指定的其他渠道，对其个人信息进行查询、更正。', 20, 925);
      that.textEllipsis(ctx, '（四）乙方应严格按照《网络安全法》、《全国人民代表大会常务委员会关于加强网络信息保护的决定》、《电信和互联网用户个人信息保护规定》（工业和信息化部令第24号）、《电话用户真实身份信息登记规定》（工业和信息化部令第25号）等法律法规的相关要求，对其在提供服务过程中收集、使用的甲方用户个人信息履行保护义务。', 20, 1125);
      that.textEllipsis(ctx, '第七条 违约责任', 20, 1275);
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

              let signImg = that.data.signImg;
              that.setData({
                signImg: signImg + 'data:image/jpeg;base64,' + res.data
              })
              /* let signImg = "signImg[3]"
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
            fileName: new Date().getTime() + '_4_' + app.globalData.mobile,
            fechType: 1,
            type: 3
          };
          FILE(url, name, res.tempFilePath, param, false).then(function (res, jec1) {
            console.log('res4', res);
            if (res.code == 200) {
              let signImg = "signImg[3]"
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
  //生成协议图片5
  drawNote5() {
    let that = this;
    let ctx = that.data.myCanvas1_ctx;
    let canvas = that.data.myCanvas1_canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    return new Promise(function (resolve, reject) {
      ctx.fillStyle = "#FFFFFF";
      ctx.restore();
      ctx.fillStyle = "#000000";
      ctx.textAlign = 'left';
      that.textEllipsis(ctx, '（一）一方违约给对方造成损失的，应当依法承担赔偿责任，但违约方应承担的赔偿损失的责任范围不包括守约方未实现的预期利润或利益、商业信誉的损失、丢失的数据本身及因数据丢失引起的损失、守约方对第三方的责任及其他间接损失。', 20, 50); //5180
      that.textEllipsis(ctx, '（二）因不可抗力导致本协议部分或全部不能履行的，双方可部分或全部免除责任。', 20, 175);
      that.textEllipsis(ctx, '第八条 协议的变更与解除', 20, 225);
      that.textEllipsis(ctx, '（一）乙方在本协议外以公告、使用手册、资费单页等书面形式公开做出的服务承诺，甲方办理各类业务所签署的表单、业务协议（须知）等均自动成为本协议的补充协议；与本协议冲突部分以补充协议为准，补充协议中未约定部分以本协议为准。', 20, 250);
      that.textEllipsis(ctx, '（二）甲方要求终止服务前，需缴清应支付给乙方的全部费用（含前期所有欠费、违约金和终止服务当月已产生的费用）。', 20, 375);
      that.textEllipsis(ctx, '（三）有下列情形之一的，乙方有权单方终止服务，解除协议，收回号码，并保留追究甲方违约责任的权利：', 20, 450);
      that.textEllipsis(ctx, '1、甲方提供的有效身份证件（包括本人、受托人、法定代理人、经办人等提供的有效身份证件）虚假、不实，可能给乙方带来经营风险的；', 20, 500);
      that.textEllipsis(ctx, '2、甲方未办理相关手续，自行改变移动网业务使用性质或私自转让租用权的；', 20, 575);
      that.textEllipsis(ctx, '3、甲方欠费停止服务后满30天仍未及时缴清相关费用的', 20, 625);
      that.textEllipsis(ctx, '4、产品（服务）超过约定有效期的；', 20, 650);
      that.textEllipsis(ctx, '5、甲方利用乙方号码和其他产品被国家司法机关认定用于违法犯罪活动或其它不当用途的；', 20, 675);
      that.textEllipsis(ctx, '6、乙方收到国家行政管理部门通知要求停止甲方产品服务的；', 20, 725);
      that.textEllipsis(ctx, '7、甲方利用乙方提供的服务从事违背公序良俗及违法犯罪的活动；', 20, 775);
      that.textEllipsis(ctx, '8、法律法规规定的其他情形。', 20, 825);
      that.textEllipsis(ctx, '（四）因技术进步或国家政策等原因导致本协议（部分或全部）无法继续履行的，乙方保留对产品（服务）做出调整的权利，调整前乙方应至少提前90日发布公告并提出相应解决方案。甲方可就解决方案与乙方协商，但不得要求乙方继续履行本协议。', 20, 850);
      that.textEllipsis(ctx, '（五）因乙方战略调整导致本协议（部分或全部）无法继续履行的，乙方保留对产品（服务）做出调整的权利，调整前乙方应至少提前30日发布公告并提出相应解决方案。甲方可就解决方案与乙方协商，但不得要求乙方继续履行本协议。', 20, 975);
      that.textEllipsis(ctx, '第九条 特别提示', 20, 1075);
      that.textEllipsis(ctx, '（一）甲方或其受托人、法定代理人、经办人已详细阅读本协议的全部条款，甲方或其受托人、法定代理人、经办人在签署本协议后即视为完全理解并同意接受本协议的全部条款。通过网络渠道办理入网手续时，甲方已通过网页或程序提示等方式详细阅读本协议的全部条款，并产生了后续预约、收卡、号卡激活等行为，即视为完全理解并同意接受本协议的全部条款。', 20, 1100);
      that.textEllipsis(ctx, '（二）为了更好的享受通信服务，甲方同意乙方发送话费赠送、流量赠送、促销活动等适配甲方消费特征的优惠信息。甲方可向乙方申请停止发送前述信息，乙方接到申请后，即日起停止向甲方发送。', 20, 1275);
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

              let signImg = that.data.signImg;
              that.setData({
                signImg: signImg + 'data:image/jpeg;base64,' + res.data
              })
              /* let signImg = "signImg[4]"
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
            fileName: new Date().getTime() + '_5_' + app.globalData.mobile,
            fechType: 1,
            type: 3
          };
          FILE(url, name, res.tempFilePath, param, false).then(function (res, jec1) {
            console.log('res5', res);
            if (res.code == 200) {
              let signImg = "signImg[4]"
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
  //生成协议图片6
  drawNote6() {
    let that = this;
    let ctx = that.data.myCanvas1_ctx;
    let canvas = that.data.myCanvas1_canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    return new Promise(function (resolve, reject) {
      ctx.fillStyle = "#FFFFFF";
      ctx.restore();
      ctx.fillStyle = "#000000";
      ctx.textAlign = 'left';
      that.textEllipsis(ctx, '（三）甲方过户或销户前，需自行在银行、网购等第三方取消已绑定号码，未及时取消造成的后果由甲方承担。', 20, 50); //6505
      that.textEllipsis(ctx, '第十条 争议解决', 20, 100);
      that.textEllipsis(ctx, '有关协议争议，双方可沟通协商解决；协商不成的，甲方可向当地通信管理局或消费者协会申请进行调解；任何一方均可向乙方住所地的人民法院起诉。', 20, 125);
      that.textEllipsis(ctx, '第十一条 其他', 20, 200);
      that.textEllipsis(ctx, '本协议一式两份，甲乙双方各执一份，自业务受理之日起生效，有效期至乙方移动转售业务试点结束。到期时，若乙方取得正式移动业务转售资格且双方均无异议，本协议以一年为周期逐年自动顺延。', 20, 225);
      that.textEllipsis(ctx, '若乙方在协议期内经工业和信息化部批准同意提前结束移动转售业务试点经营，或试点期结束后未取得正式转售移动业务资格，乙方如果终止经营，乙方应当在终止经营前90日通知甲方，并在收到工信部明确批复后，通过相关渠道和途径免费为甲方完成产品和服务退订、预付款返还、费用结算、争议解决等工作。乙方不承担甲方因退订产品和服务而产生的任何直接或间接损失。', 20, 325);
      that.textEllipsis(ctx, '（附一）', 20, 500);
      ctx.font = 'normal bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('华翔联信大语音卡业务协议', 375 / 2, 525);
      ctx.textAlign = 'left';
      that.textEllipsis(ctx, '甲乙双方本着平等自愿的原则，经友好协商，就通信业务合作相关事宜达成以下协议：', 20, 555);
      that.textEllipsis(ctx, '一、声明及承诺', 20, 605);
      that.textEllipsis(ctx, '1、双方作为独立合同主体，将依法履行其在本协议下的权利和义务，并自行承担相应的法律责任和后果。', 20, 630);
      that.textEllipsis(ctx, '2、甲方接受乙方就通信业务制定的规范性要求，同意乙方拥有合理修订规范性要求的权利。', 20, 680);
      that.textEllipsis(ctx, '二、责任与义务', 20, 730);
      that.textEllipsis(ctx, '1、 甲方不得使用语音卡从事违反法律、法规、国家政策的活动。否则乙方有权对甲方号码进行停机销户处理，乙方有权单方终止合作，由此造成的责任和损失，甲方自行承担。', 20, 755);
      that.textEllipsis(ctx, '2、 甲方应严格遵守实名制规定，保证用户资料的真实性。若甲方用户资料存在不实、伪造等问题，乙方有权对号码进行停机处理；若甲方蓄意伪造身份信息，乙方有权对甲方所有号码进行停机销户处理，有权单方终止合作，由此造成的责任和损失，甲方自行承担。', 20, 830);
      that.textEllipsis(ctx, '3、 甲方业务活动需符合《通信业务确认书》中填报的内容，外呼对象应为甲方自有签约用户，愿意接收甲方致电，若甲方违规使用造成了投诉、举报，乙方有权对甲方的所有号码进行停机处理，乙方有权单方终止合作。由此产生的一切纠纷，甲方负责解决并承担相应责任。', 20, 955);
      that.textEllipsis(ctx, '4、 乙方有权对甲方业务活动进行监督，并向甲方提出整改要求。若甲方号码被工信部、公安局、各省通信管理局等国家监管部门通报为违规号码，乙方有权对被通报号码进行停机销户处理，若监管周期（上月26日至本月25日，以监管部门要求为准）内，被通报率（监管周期内，被通报次数/有主叫通话的号码数量）超过0.5%，乙方有权对甲方所有号码进行停机销户处理，有权单方终止合作，由此造成的责任和损失，甲方自行承担。', 20, 1080);
      that.textEllipsis(ctx, '5、 甲方仅可将乙方提供的通信产品配发给自有员工使用，不得将语音卡转售、转租、转借第三方，否则乙方有权单方终止合作，相应的责任和赔偿由甲方自行承担。', 20, 1280);
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

              let signImg = that.data.signImg;
              that.setData({
                signImg: signImg + 'data:image/jpeg;base64,' + res.data
              })
              /* let signImg = "signImg[5]"
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
            fileName: new Date().getTime() + '_6_' + app.globalData.mobile,
            fechType: 1,
            type: 3
          };
          FILE(url, name, res.tempFilePath, param, false).then(function (res, jec1) {
            console.log('res6', res);
            if (res.code == 200) {
              let signImg = "signImg[5]"
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
  //生成协议图片7
  drawNote7() {
    let that = this;
    let ctx = that.data.myCanvas1_ctx;
    let canvas = that.data.myCanvas1_canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    return new Promise(function (resolve, reject) {
      ctx.fillStyle = "#FFFFFF";
      ctx.restore();
      ctx.fillStyle = "#000000";
      ctx.textAlign = 'left';
      that.textEllipsis(ctx, '甲方：', 20, 50); //8495
      that.textEllipsis(ctx, '乙方：北京华翔联信科技有限公司', 20, 75);
      that.textEllipsis(ctx, '被告知人：', 20, 125);
      that.textEllipsis(ctx, '日       期：' + that.data.datetime, 20, 175);
      let img = canvas.createImage();
      img.src = that.data.sign;
      img.onload = function () {
        ctx.drawImage(img, 0, 0, this.width, this.height, 120, 90, 100, 50);
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

                let signImg = that.data.signImg;
                that.setData({
                  signImg: signImg + 'data:image/jpeg;base64,' + res.data
                })
                /* let signImg = "signImg[6]"
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
              fileName: new Date().getTime() + '_7_' + app.globalData.mobile,
              fechType: 1,
              type: 3
            };
            FILE(url, name, res.tempFilePath, param, false).then(function (res, jec1) {
              console.log('res7', res);
              if (res.code == 200) {
                let signImg = "signImg[6]"
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
        })
      }
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