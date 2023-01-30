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
    canvasName: 'handWriting',
    ctx: '',
    showText: false,
    disabled: false,
    canvasWidth: 0,
    canvasHeight: 0,
    transparent: 1, // 透明度
    selectColor: 'black',
    lineColor: '#1A1A1A', // 颜色
    lineSize: 1.5, // 笔记倍数
    lineMin: 0.5, // 最小笔画半径
    lineMax: 4, // 最大笔画半径
    pressure: 1, // 默认压力
    smoothness: 60, //顺滑度，用60的距离来计算速度
    currentPoint: {},
    currentLine: [], // 当前线条
    firstTouch: true, // 第一次触发
    radius: 1, //画圆的半径
    cutArea: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }, //裁剪区域
    bethelPoint: [], //保存所有线条 生成的贝塞尔点；
    lastPoint: 0,
    chirography: [], //笔迹
    currentChirography: {}, //当前笔迹
    linePrack: [], //划线轨迹 , 生成线条的实际点
    width: '',
    height: '',
    hide: true,
    checked: false,
    myCanvas1_canvas: '',
    myCanvas1_ctx: '',
    myCanvas2_canvas: '',
    myCanvas2_ctx: '',
    fileId: '', //签名照id
    statusBarHeight: app.globalData.statusBarHeight + 'px',
    navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
    top: (app.globalData.statusBarHeight + 44) + 'px',
    signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
    back: 0,
    isDraw: false,
  },
  onLoad() {
    let canvasName = this.data.canvasName
    let ctx = wx.createCanvasContext(canvasName)
    const that = this;
    that.setData({
      ctx: ctx,
      type: app.globalData.steps,
      width: app.globalData.windowWidth,
      height: app.globalData.windowHeight,
      canvasWidth: app.globalData.windowWidth,
      canvasHeight: app.globalData.windowHeight,
    })
    var query = wx.createSelectorQuery();
    setTimeout(function () {
      query.select('.handCenter').boundingClientRect(rect => {
        console.log(rect);
        that.setData({
          canvasWidth: rect.width,
          canvasHeight: rect.height
        })
      });
    }, 500);
    query.select('#myCanvas1').fields({
      node: true,
      size: true
    });
    query.select('#myCanvas2').fields({
      node: true,
      size: true
    });
    query.exec((res) => {
      const canvas1 = res[0].node
      const ctx1 = canvas1.getContext('2d')
      const canvas2 = res[1].node
      const ctx2 = canvas2.getContext('2d')
      canvas1.width = app.globalData.windowWidth
      canvas1.height = app.globalData.windowHeight
      that.setData({
        myCanvas1_canvas: canvas1,
        myCanvas1_ctx: ctx1,
        myCanvas2_canvas: canvas2,
        myCanvas2_ctx: ctx2,
      });
    })
    that.setData({
      datetime: formatTime(new Date()),
    })
  },
  onShow() {
    const that = this;
    if (that.data.sign) {
      that.setData({
        nextStepTitle: '下一步'
      });
    }
    //console.log(app.globalData);
  },
  //绘制签名告知书
  drawNote() {
    const that = this;
    const ctx = that.data.myCanvas1_ctx;
    const canvas = that.data.myCanvas1_canvas;
    return new Promise(function (resolve, reject) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.fillStyle = "#000000";
      ctx.font = 'normal bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('电话卡合规使用告知书', app.globalData.windowWidth / 2, 50);
      ctx.textAlign = 'left';
      that.textEllipsis(ctx, '为配合国家涉诈电话卡防范治理工作，特向华翔电话卡用户告知相关规定如下：', 20, 80);
      that.textEllipsis(ctx, '凡华翔电话卡用户不得将电话卡违规转售、转租、转借第三方，否则我司有权解除合同、终止服务，并移交司法部门处置。', 20, 130);
      that.textEllipsis(ctx, '按照《中华人民共和国刑法修正案（九）》第二百八十七条之二，明知他人利用信息网络实施犯罪，为其犯罪提供互联网接入、服务器托管、网络存储、通讯传输等技术支持，或者提供广告推广、支付结算等帮助，情节严重的，将处三年以下有期徒刑或者拘役，并处或者单处罚金。', 20, 200);
      that.textEllipsis(ctx, '本人已清楚了解告知书所提示内容，本人愿意遵守国家法规并承担相应法律责任。', 20, 320);
      that.textEllipsis(ctx, '被告知人：', 20, 380);
      that.textEllipsis(ctx, '日       期：' + that.data.datetime, 20, 420);
      let img = canvas.createImage();
      img.src = that.data.sign;
      img.onload = function () {
        ctx.drawImage(img, 0, 0, this.width, this.height, 100, 350, 100, 50);
        wx.canvasToTempFilePath({
          canvasId: 'firstCanvas',
          fileType: 'jpg',
          canvas: canvas,
          quality: 1, //图片质量
          success(res) {
            let url = baseUrl + '/api/uploadFileSas';
            let name = 'clientFile';
            let param = {
              fileName: new Date().getTime() + '_' + app.globalData.mobile,
              fechType: 1,
              type: 3
            };
            FILE(url, name, res.tempFilePath, param, false).then(function (res1, jec1) {
              //console.log('res1',res1);
              if (res1.code == 200) {
                app.globalData.signImg = res1.datas.picnamehand
                resolve(true);
              } else {
                reject(false);
              }
            }).catch((error) => {
              reject(false);
            });
          },
          fail(res) {
            reject(false);
          }
        })
      }
    });
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
      maxWidth: app.globalData.windowWidth / 1.14,
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
  //显示手写板
  addSign() {
    const that = this;
    that.setData({
      signed: true,
    });
  },
  //画笔轨迹开始
  uploadScaleStart(e) {
    if (e.type != 'touchstart') return false;
    this.setData({
      showText: true,
      isDraw: true,
    });
    let ctx = this.data.ctx;
    ctx.setFillStyle(this.data.lineColor); // 初始线条设置颜色
    ctx.setGlobalAlpha(this.data.transparent); // 设置半透明
    let currentPoint = {
      x: e.touches[0].x,
      y: e.touches[0].y
    }
    let currentLine = this.data.currentLine;
    currentLine.unshift({
      time: new Date().getTime(),
      dis: 0,
      x: currentPoint.x,
      y: currentPoint.y
    })
    this.setData({
      currentPoint,
      // currentLine
    })
    if (this.data.firstTouch) {
      this.setData({
        cutArea: {
          top: currentPoint.y,
          right: currentPoint.x,
          bottom: currentPoint.y,
          left: currentPoint.x
        },
        firstTouch: false
      })
    }
    this.pointToLine(currentLine);
  },
  //画笔轨迹移动
  uploadScaleMove(e) {
    if (e.type != 'touchmove') return false;
    if (e.cancelable) {
      // 判断默认行为是否已经被禁用
      if (!e.defaultPrevented) {
        e.preventDefault();
      }
    }
    let point = {
      x: e.touches[0].x,
      y: e.touches[0].y
    }
    //测试裁剪
    if (point.y < this.data.cutArea.top) {
      this.data.cutArea.top = point.y;
    }
    if (point.y < 0) this.data.cutArea.top = 0;

    if (point.x > this.data.cutArea.right) {
      this.data.cutArea.right = point.x;
    }
    if (this.data.canvasWidth - point.x <= 0) {
      this.data.cutArea.right = this.data.canvasWidth;
    }
    if (point.y > this.data.cutArea.bottom) {
      this.data.cutArea.bottom = point.y;
    }
    if (this.data.canvasHeight - point.y <= 0) {
      this.data.cutArea.bottom = this.data.canvasHeight;
    }
    if (point.x < this.data.cutArea.left) {
      this.data.cutArea.left = point.x;
    }
    if (point.x < 0) this.data.cutArea.left = 0;
    this.setData({
      lastPoint: this.data.currentPoint,
      currentPoint: point
    })
    let currentLine = this.data.currentLine
    currentLine.unshift({
      time: new Date().getTime(),
      dis: this.distance(this.data.currentPoint, this.data.lastPoint),
      x: point.x,
      y: point.y
    })
    this.pointToLine(currentLine);
  },
  //画笔轨迹结束
  uploadScaleEnd(e) {
    if (e.type != 'touchend') return 0;
    let point = {
      x: e.changedTouches[0].x,
      y: e.changedTouches[0].y
    }
    this.setData({
      lastPoint: this.data.currentPoint,
      currentPoint: point
    })
    let currentLine = this.data.currentLine
    currentLine.unshift({
      time: new Date().getTime(),
      dis: this.distance(this.data.currentPoint, this.data.lastPoint),
      x: point.x,
      y: point.y
    })
    // this.setData({
    //   currentLine
    // })
    if (currentLine.length > 2) {
      var info = (currentLine[0].time - currentLine[currentLine.length - 1].time) / currentLine.length;
      //$("#info").text(info.toFixed(2));
    }
    //一笔结束，保存笔迹的坐标点，清空，当前笔迹
    //增加判断是否在手写区域；
    this.pointToLine(currentLine);
    var currentChirography = {
      lineSize: this.data.lineSize,
      lineColor: this.data.lineColor
    };
    var chirography = this.data.chirography
    chirography.unshift(currentChirography);
    this.setData({
      chirography
    })
    var linePrack = this.data.linePrack
    linePrack.unshift(this.data.currentLine);
    this.setData({
      linePrack,
      currentLine: []
    })
  },
  //重写
  retDraw() {
    this.setData({
      showText: false,
      isDraw: false
    });
    this.data.ctx.clearRect(0, 0, 700, 730)
    this.data.ctx.draw()
  },
  //画两点之间的线条；参数为:line，会绘制最近的开始的两个点
  pointToLine(line) {
    this.calcBethelLine(line);
    return;
  },
  //计算插值的方式
  calcBethelLine(line) {
    if (line.length <= 1) {
      line[0].r = this.data.radius;
      return;
    }
    let x0, x1, x2, y0, y1, y2, r0, r1, r2, len, lastRadius, dis = 0,
      time = 0,
      curveValue = 0.5;
    if (line.length <= 2) {
      x0 = line[1].x
      y0 = line[1].y
      x2 = line[1].x + (line[0].x - line[1].x) * curveValue;
      y2 = line[1].y + (line[0].y - line[1].y) * curveValue;
      //x2 = line[1].x;
      //y2 = line[1].y;
      x1 = x0 + (x2 - x0) * curveValue;
      y1 = y0 + (y2 - y0) * curveValue;
    } else {
      x0 = line[2].x + (line[1].x - line[2].x) * curveValue;
      y0 = line[2].y + (line[1].y - line[2].y) * curveValue;
      x1 = line[1].x;
      y1 = line[1].y;
      x2 = x1 + (line[0].x - x1) * curveValue;
      y2 = y1 + (line[0].y - y1) * curveValue;
    }
    //从计算公式看，三个点分别是(x0,y0),(x1,y1),(x2,y2) ；(x1,y1)这个是控制点，控制点不会落在曲线上；实际上，这个点还会手写获取的实际点，却落在曲线上
    len = this.distance({
      x: x2,
      y: y2
    }, {
      x: x0,
      y: y0
    });
    lastRadius = this.data.radius;
    for (let n = 0; n < line.length - 1; n++) {
      dis += line[n].dis;
      time += line[n].time - line[n + 1].time;
      if (dis > this.data.smoothness) break;
    }
    this.setData({
      radius: Math.min(time / len * this.data.pressure + this.data.lineMin, this.data.lineMax) * this.data.lineSize
    });
    line[0].r = this.data.radius;
    //计算笔迹半径；
    if (line.length <= 2) {
      r0 = (lastRadius + this.data.radius) / 2;
      r1 = r0;
      r2 = r1;
      //return;
    } else {
      r0 = (line[2].r + line[1].r) / 2;
      r1 = line[1].r;
      r2 = (line[1].r + line[0].r) / 2;
    }
    let n = 5;
    let point = [];
    for (let i = 0; i < n; i++) {
      let t = i / (n - 1);
      let x = (1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * x1 + t * t * x2;
      let y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y2;
      let r = lastRadius + (this.data.radius - lastRadius) / n * i;
      point.push({
        x: x,
        y: y,
        r: r
      });
      if (point.length == 3) {
        let a = this.ctaCalc(point[0].x, point[0].y, point[0].r, point[1].x, point[1].y, point[1].r, point[2].x, point[2].y, point[2].r);
        a[0].color = this.data.lineColor;
        // let bethelPoint = this.data.bethelPoint;
        // console.log(a)
        // console.log(this.data.bethelPoint)
        // bethelPoint = bethelPoint.push(a);
        this.bethelDraw(a, 1);
        point = [{
          x: x,
          y: y,
          r: r
        }];
      }
    }
    this.setData({
      currentLine: line
    })
  },
  //求两点之间距离
  distance(a, b) {
    let x = b.x - a.x;
    let y = b.y - a.y;
    return Math.sqrt(x * x + y * y);
  },
  ctaCalc(x0, y0, r0, x1, y1, r1, x2, y2, r2) {
    let a = [],
      vx01, vy01, norm, n_x0, n_y0, vx21, vy21, n_x2, n_y2;
    vx01 = x1 - x0;
    vy01 = y1 - y0;
    norm = Math.sqrt(vx01 * vx01 + vy01 * vy01 + 0.0001) * 2;
    vx01 = vx01 / norm * r0;
    vy01 = vy01 / norm * r0;
    n_x0 = vy01;
    n_y0 = -vx01;
    vx21 = x1 - x2;
    vy21 = y1 - y2;
    norm = Math.sqrt(vx21 * vx21 + vy21 * vy21 + 0.0001) * 2;
    vx21 = vx21 / norm * r2;
    vy21 = vy21 / norm * r2;
    n_x2 = -vy21;
    n_y2 = vx21;
    a.push({
      mx: x0 + n_x0,
      my: y0 + n_y0,
      color: "#1A1A1A"
    });
    a.push({
      c1x: x1 + n_x0,
      c1y: y1 + n_y0,
      c2x: x1 + n_x2,
      c2y: y1 + n_y2,
      ex: x2 + n_x2,
      ey: y2 + n_y2
    });
    a.push({
      c1x: x2 + n_x2 - vx21,
      c1y: y2 + n_y2 - vy21,
      c2x: x2 - n_x2 - vx21,
      c2y: y2 - n_y2 - vy21,
      ex: x2 - n_x2,
      ey: y2 - n_y2
    });
    a.push({
      c1x: x1 - n_x2,
      c1y: y1 - n_y2,
      c2x: x1 - n_x0,
      c2y: y1 - n_y0,
      ex: x0 - n_x0,
      ey: y0 - n_y0
    });
    a.push({
      c1x: x0 - n_x0 - vx01,
      c1y: y0 - n_y0 - vy01,
      c2x: x0 + n_x0 - vx01,
      c2y: y0 + n_y0 - vy01,
      ex: x0 + n_x0,
      ey: y0 + n_y0
    });
    a[0].mx = a[0].mx.toFixed(1);
    a[0].mx = parseFloat(a[0].mx);
    a[0].my = a[0].my.toFixed(1);
    a[0].my = parseFloat(a[0].my);
    for (let i = 1; i < a.length; i++) {
      a[i].c1x = a[i].c1x.toFixed(1);
      a[i].c1x = parseFloat(a[i].c1x);
      a[i].c1y = a[i].c1y.toFixed(1);
      a[i].c1y = parseFloat(a[i].c1y);
      a[i].c2x = a[i].c2x.toFixed(1);
      a[i].c2x = parseFloat(a[i].c2x);
      a[i].c2y = a[i].c2y.toFixed(1);
      a[i].c2y = parseFloat(a[i].c2y);
      a[i].ex = a[i].ex.toFixed(1);
      a[i].ex = parseFloat(a[i].ex);
      a[i].ey = a[i].ey.toFixed(1);
      a[i].ey = parseFloat(a[i].ey);
    }
    return a;
  },
  bethelDraw(point, is_fill, color) {
    let ctx = this.data.ctx;
    ctx.beginPath();
    ctx.moveTo(point[0].mx, point[0].my);
    if (undefined != color) {
      ctx.setFillStyle(color);
      ctx.setStrokeStyle(color);
    } else {
      ctx.setFillStyle(point[0].color);
      ctx.setStrokeStyle(point[0].color);
    }
    for (let i = 1; i < point.length; i++) {
      ctx.bezierCurveTo(point[i].c1x, point[i].c1y, point[i].c2x, point[i].c2y, point[i].ex, point[i].ey);
    }
    ctx.stroke();
    if (undefined != is_fill) {
      ctx.fill(); //填充图形 ( 后绘制的图形会覆盖前面的图形, 绘制时注意先后顺序 )
    }
    ctx.draw(true)
  },
  //保存签名
  saveCanvasAsImg() {
    const that = this;
    wx.canvasToTempFilePath({
      canvasId: 'handWriting',
      fileType: 'png',
      quality: 1, //图片质量
      success(res) {
        wx.getImageInfo({
          src: res.tempFilePath,
          success: function (ress) {
            let option = {
              canvas: that.data.myCanvas2_canvas,
              ctx: that.data.myCanvas2_ctx,
              canvasId: 'secendCanvas',
              imgsrc: res.tempFilePath,
              destWidth: ress.width,
              destHeight: ress.height,
              rotate: 0
            }
            CanvasToImage(option).then((data) => {
              console.log('data', data);
              that.uploadHandWriting(data)
            }).catch((error) => {
              console.log('err', error);
            });
          },
          fail(res) {
            console.log('errrq', res);
          }
        })
      },
      fail(res) {
        console.log('errrrc', res);
      }
    })
  },
  //上传签名照
  uploadHandWriting(clientFile) {
    const that = this;
    const url = baseUrl + '/api/uploadHandWriting'
    let param = {
      fileName: new Date().getTime() + '_' + app.globalData.mobile,
      custName: wx.getStorageSync('picname'),
    };
    console.log('sin:', clientFile);
    return new Promise(function (resolve, reject) {
      FILE(url, 'clientFile', clientFile, param)
        .then((res) => {
          if (res.code == 200) {
            let datas = res.datas
            if (datas.checkResult == 1) {
              that.setData({
                fileId: datas.fileId,
                signed: false,
                back: 0,
                sign: clientFile,
                showText: false,
                nextStepTitle: '下一步'
              });
            } else {
              wx.showToast({
                icon: 'none',
                mask: true,
                title: '签名对比失败，请重新书写',
              });
            }
          } else {
            reject(res);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  //监听协议勾选
  onChange(e) {
    this.setData({
      checked: e.detail
    });
  },
  /**
   * 点击下一步操作
   */
  nextStep(e) {
    const that = this;
    if (that.data.isDraw) { //已经签名了
      if (!that.data.checked) {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: '请同意并勾选'
        });
        return false;
      }
      that.drawNote().then(function (res, rej) {
        if (res) {
          that.submitOrder().then((res) => {
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
          });
        }
      }).catch((error) => {
        wx.showToast({
          icon: 'none',
          mask: true,
          title: '请求失败，请稍后再试'
        });
      });
    } else { //未签名
      that.setData({
        signed: true,
        back: 1,
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
          wx.showToast({
            icon: 'none',
            mask: true,
            title: res.msg,
          });
          reject();
        }
      }).catch(() => {
        reject();
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