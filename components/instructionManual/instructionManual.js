import {
  formatDate,
} from '../../utils/util'
Component({
  properties: {
    signed: { // 是否签名
      type: Boolean,
      value: false,
    },
    signImg:{ //签名图片
      type:String,
      value:'',
    }
  },
  data: {
    custname: '',
    datetime:formatDate(new Date()),
    sign:'',
  },
  lifetimes: {
    attached() {
      let that = this;
      let userName = '';
      let custname = wx.getStorageSync('custname');
      let idcardA = wx.getStorageSync('idcardA');
      if(wx.getStorageSync('custname') != ''){
        userName = custname
      }
      if(idcardA !='' && idcardA.cardInfo.姓名 != undefined){
        userName = idcardA.cardInfo.姓名.words
      }
      that.setData({
        custname: userName
      });
      let observer = that.createIntersectionObserver();
      observer.relativeTo('.scroll-view').observe('.bottom', (res) => {
        let appear = res.intersectionRatio > 0;
        that.triggerEvent('myevent', appear);
      });
    },
  }
});