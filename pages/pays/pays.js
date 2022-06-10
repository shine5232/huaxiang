Page({
    data: {

    },
    onLoad: function (options) {
        console.log(options);
        let opt = decodeURIComponent(options.parames);
        let parms = opt.split('#');
        let timeStamp = parms[0];
        let nonceStr = parms[1];
        let packages = parms[2];
        let paySign = parms[3];
        wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: nonceStr,
            package: packages,
            signType: 'MD5',
            paySign: paySign,
            success(res) {
                console.log(res);
                wx.reLaunch({
                    url: '/pages/complete/complete'
                });
            },
            fail(res) {
                console.log(res);
                wx.reLaunch({
                    url: '/pages/prepay/prepay'
                });
            },
            complete(res) {
                /* wx.reLaunch({
                    url: '/pages/complete/complete'
                }); */
            }
        });
    },
    onShow: function () {

    },
    onHide: function () {

    },
    onUnload: function () {

    },

})