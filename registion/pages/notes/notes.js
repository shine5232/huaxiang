import Dialog from '../../../miniprogram_npm/@vant/weapp/dialog/dialog'
import {
    formatDate,
    secondToMinSec
} from '../../../utils/util'
import {
    OBSupload
} from '../../../utils/promise'
var app = getApp();

Page({
    data: {
        btntitle: '准备好了，开始录制',
        start: true,
        overlay: false,
        num: [],
        type: 3,
        active: 1,
        time: 5,
        timer: null,
        disabled: true,
        titles: '我已阅读知晓5s',
        ctx: '',
        ybcode: '',
        city: '',
        showInfo: true,
        mobile: '',
        name: '',
        date: '',
        overlaycard: true,
        overlaycards: false,
        overlaycardt: false,
        isBioass: true,
        title: '下一步，告知签署',
        times: null,
        second: 0, //秒数
        timeShow: '00:00', //显示时长信息
        statusBarHeight: app.globalData.statusBarHeight + 'px',
        navigationBarHeight: (app.globalData.statusBarHeight + 44) + 'px',
        top: (app.globalData.statusBarHeight + 44) + 'px',
        signHeight: (app.globalData.windowHeight - (app.globalData.statusBarHeight + 44)) + 'px',
    },
    onLoad() {
        const that = this;
        const ctx = wx.createCameraContext({
            "device-position": "front"
        });
        that.setData({
            mobile: wx.getStorageSync('mobile'),
            name: wx.getStorageSync('picname'),
            date: formatDate(new Date()),
            ctx: ctx,
            isBioass: !app.globalData.isBioass,
            title: app.globalData.isBioass ? '下一步' : '下一步，告知签署',
        });
    },
    onShow() {
        const that = this;
        if (!app.globalData.isBioass) {
            that.getAuthVioce().then((data) => {
                that.timeOut();
            }).catch((error) => {});
        }
    },
    //阅读倒计时
    timeOut() {
        const that = this;
        let timer = setInterval(function () {
            let time = that.data.time--;
            if (time > 0) {
                that.setData({
                    titles: '我已阅读知晓' + time + 's'
                });
            } else {
                clearInterval(that.data.timer);
                that.setData({
                    disabled: false,
                    titles: '下一步'
                });
            }
        }, 1000);
        that.setData({
            timer: timer
        });
    },
    //获取录音录像权限
    getAuthVioce() {
        return new Promise(function (resolve, reject) {
            wx.getSetting({
                success(res) {
                    if (!res.authSetting['scope.camera']) { //获取摄像头权限
                        wx.authorize({
                            scope: 'scope.camera',
                            success() {
                                //console.log('授权成功')
                                resolve(true);
                            },
                            fail() {
                                wx.showModal({
                                    title: '提示',
                                    content: '尚未进行授权，部分功能将无法使用',
                                    showCancel: false,
                                    success(res) {
                                        if (res.confirm) {
                                            //console.log('用户点击确定')
                                            wx.openSetting({ //这里的方法是调到一个添加权限的页面，可以自己尝试
                                                success: (res) => {
                                                    if (!res.authSetting['scope.camera']) {
                                                        wx.authorize({
                                                            scope: 'scope.camera',
                                                            success() {
                                                                //console.log('授权成功')
                                                                resolve(true);
                                                            },
                                                            fail() {
                                                                //console.log('用户点击取消')
                                                                resolve(false);
                                                            }
                                                        })
                                                    } else {
                                                        resolve(true);
                                                    }
                                                },
                                                fail: function () {
                                                    //console.log("授权设置录音失败");
                                                    reject(false);
                                                }
                                            })
                                        } else if (res.cancel) {
                                            //console.log('用户点击取消1')
                                            reject(false);
                                        }
                                    }
                                })
                            }
                        })
                    } else {
                        resolve(true);
                    }
                    if (!res.authSetting['scope.record']) { //获取录音机权限
                        wx.authorize({
                            scope: 'scope.record',
                            success() {
                                //console.log('授权成功')
                                resolve(true);
                            },
                            fail() {
                                wx.showModal({
                                    title: '提示',
                                    content: '尚未进行授权，部分功能将无法使用',
                                    showCancel: false,
                                    success(res) {
                                        if (res.confirm) {
                                            //console.log('用户点击确定')
                                            wx.openSetting({ //这里的方法是调到一个添加权限的页面，可以自己尝试
                                                success: (res) => {
                                                    if (!res.authSetting['scope.record']) {
                                                        wx.authorize({
                                                            scope: 'scope.record',
                                                            success() {
                                                                //console.log('授权成功')
                                                                resolve(true);
                                                            },
                                                            fail() {
                                                                //console.log('用户点击取消')
                                                                resolve(false);
                                                            }
                                                        })
                                                    } else {
                                                        resolve(true);
                                                    }
                                                },
                                                fail: function () {
                                                    //console.log("授权设置录音失败");
                                                    reject(false);
                                                }
                                            })
                                        } else if (res.cancel) {
                                            //console.log('用户点击取消1')
                                            reject(false);
                                        }
                                    }
                                })
                            }
                        })
                    } else {
                        resolve(true);
                    }
                }
            })
        });
    },
    //开始录制
    takePhotoStart() {
        const that = this;
        that.data.ctx.startRecord({
            timeoutCallback: function (res) {},
            success: function (res) {
                that.countTime();
            }
        });
    },
    //计算录制时间
    countTime() {
        const that = this;
        that.setData({
            timeShow: '00:00',
            second: 0,
            start: false,
            btntitle: '已录制 00:00 , 结束录制'
        });
        let timer = setInterval(function () {
            let second = Number(that.data.second) + 1;
            let time = secondToMinSec(second);
            that.setData({
                second: second,
                timeShow: time,
                btntitle: '已录制 ' + time + ' , 结束录制'
            });
        }, 1000);
        that.setData({
            times: timer
        });
    },
    //结束录制
    takePhotoEnd() {
        const that = this;
        clearInterval(that.data.times);
        that.setData({
            second: 0,
            timeShow: '00:00',
        });
        wx.showLoading({
            title: '视频上传中...',
            mask: true,
        });
        that.data.ctx.stopRecord({
            compressed: true,
            success: function (res) {
                that.setData({
                    overlay: false
                });
                console.log(res.tempVideoPath);
                let fileName = "zzjh/" + wx.getStorageSync('mobile') + '_' + Date.now() + '.mp4';
                OBSupload(res.tempVideoPath, fileName).then((e, r) => {
                    if (e) {
                        wx.setStorageSync('fileName', 'https://hx-zhangting.obs.cn-north-1.myhuaweicloud.com/' + fileName);
                        wx.reLaunch({
                            url: '/registion/pages/idcard/idcard'
                        });
                    }
                }).catch((e) => {
                    that.restartVoice('上传失败，');
                });
            },
            fail: function (e) {
                that.restartVoice('上传失败，');
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },
    //重新录制
    restartVoice(msg = "检测失败，") {
        const that = this;
        that.setData({
            overlaycards: false
        });
        Dialog.confirm({
            title: '温馨提示',
            message: msg + ' 是否重新录制？',
            cancelButtonText: '返回首页',
            confirmButtonText: '重新录制',
            zIndex: 999,
        }).then(() => {
            that.setData({
                start: true,
                overlaycards: true,
                btntitle: '准备好了，开始录制',
            });
        }).catch(() => {
            wx.reLaunch({
                url: '/registion/pages/number/number'
            })
        });
    },
    //关闭弹出层
    popIdcard() {
        const that = this;
        if (that.data.time == '-1') {
            that.setData({
                overlaycard: false,
                overlaycardt: true,
            });
        }
    },
    //关闭弹出按钮
    popIdcardt() {
        const that = this;
        that.setData({
            overlaycardt: false,
            overlaycards: true,
        });
    },
    //下一步
    nextStep() {
        wx.reLaunch({
            url: '/registion/pages/notes/notes'
        })
    },
})