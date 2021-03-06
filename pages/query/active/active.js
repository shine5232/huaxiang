import {
  baseUrl,
  IdentityCodeValid
} from '../../../utils/util'
import {
  POST
} from '../../../utils/promise'
var app = getApp();
Page({
  data: {
    mobile: '',
    iccid: '',
    yzm: '',
    message: '',
    hidden: true,
    height: app.globalData.windowHeight
  },
  onLoad: function (options) {
    const that = this;
    that.code = that.selectComponent("#code");
  },
  onShow: function () {
    const that = this;
    that.getCode();
  },
  //点击获取验证码
  getCode() {
    this.code.creatCodeImg(4);
  },
  //监听手机号输入
  onChangeMobile(e) {
    let that = this;
    const mobile = e.detail;
    that.setData({
      mobile: mobile
    });
  },
  //监听身份证号输入
  onChangeIccid(e) {
    let that = this;
    const iccid = e.detail;
    that.setData({
      iccid: iccid,
    });
  },
  //监听验证码输入
  onChangeYzm(e) {
    let that = this;
    const yzm = e.detail;
    that.setData({
      yzm: yzm,
    });
  },
  //点击下一步
  nextStep() {
    const that = this;
    if (that.verifyMobile() && that.verifyIccid() && that.verifyYzm()) {
      that.query();
    }
  },
  //查询进度
  query() {
    const that = this;
    let url = baseUrl + '/hx-channel-beta/api/user/selfActivationResultSas';
    let parms = {
      custcertno: that.data.iccid,
      svcNumber: that.data.mobile,
      orderType: ''
    }
    POST(url, parms, true).then(function (res, jet) {
      that.getCode();
      if (res.code == 200) {
        let status = res.datas.status;
        let message = '查询不到相关信息；';
        let start = '您所查询的号码：' + that.data.mobile + '，';
        let end = '【华翔联信祝您生活愉快！】';
        switch (status) {
          case 1:
            message = start + '认证信息提交成功，请耐心等待审核结果。' + end;
            break;
          case 2:
            message = start + '身份信息验证成功，号码激活中，请耐心等待。' + end;
            break;
          case 3:
            message = start + '身份信息验证失败，请联系售卡代理或者致电10036客服。' + end;
            break;
          case 4:
            message = start + '激活成功，您可以使用该号码。' + end;
            break;
          case 5:
            message = start + '身份信息验证成功，号码激活中，请耐心等待。' + end;
            break;
          case 6:
            message = start + '认证信息提交成功，请耐心等待审核结果。' + end;
            break;
          case 7:
            message = start + '实名认证审核未通过，已被暂停服务，可通过“实名补登记”办理复机，审核不通过原因: （' + res.msg + '）。' + end;
            break;
          case 8:
            message = start + '实名认证审核异常，请联系相关售卡代理处理。' + end;
            break;
          case 9:
            message = start + '身份信息验证失败，请重新提交认证信息，注意确保证件拍摄清晰，并且证件与进行人脸识别的为同一个人。' + end;
            break;
          default:
            message = start + '暂未进行激活，请先完成【新卡认证激活】。' + end;
        };
        that.setData({
          hidden: false,
          message: message
        });
      } else {
        wx.showToast({
          icon:'none',
          mask:true,
          title:res.msg
        });
      }
    }).catch((e) => {});
  },
  //提交验证手机号
  verifyMobile() {
    const that = this;
    if (that.data.mobile == '') {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请输入手机号'
      });
      return false;
    } else {
      if (!/^1(3|4|5|6|7|8)\d{9}$/.test(that.data.mobile)) {
        wx.showToast({
          icon:'none',
          mask:true,
          title:'手机号码不正确'
        });
        return false;
      }
    }
    return true;
  },
  //提交验证身份证号
  verifyIccid() {
    const that = this;
    const iccid = that.data.iccid;
    if (iccid == '') {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请输入身份证号码'
      });
      return false;
    } else {
      let res = IdentityCodeValid(iccid);
      if (!res) {
        wx.showToast({
          icon:'none',
          mask:true,
          title:'请输入正确的身份证号码'
        });
        return false;
      }
    }
    return true;
  },
  //提交验证验证码
  verifyYzm() {
    const that = this;
    const yzm = that.data.yzm;
    if (yzm == '') {
      wx.showToast({
        icon:'none',
        mask:true,
        title:'请输入验证码'
      });
      return false;
    } else {
      let code = wx.getStorageSync('code');
      if (yzm.toLowerCase() != code) {
        wx.showToast({
          icon:'none',
          mask:true,
          title:'验证码不正确'
        });
        return false;
      } else {
        return true;
      }
    }
  },
})