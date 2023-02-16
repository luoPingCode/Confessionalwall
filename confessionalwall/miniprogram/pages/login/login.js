var app = getApp()
// const config = require("../../config.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show_auth: true,
    },

    /** 
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        wx.showLoading({
            title: '加载中...',
        });
        var openid = wx.getStorageSync('userInfo')
        // console.log(openid,app.globalData.userInfo)
        if (openid) {
            app.setUserInfo(openid)
            wx.hideLoading()
            wx.switchTab({
                url: '/pages/express/express'
            })
        } else {
            that.setData({
                show_auth: true
            });
            wx.hideLoading()
            //获取用户信息
            that.getUserProfile()
        }
        // wx.getSetting({
        //     success(res) {
        //         console.log(res)
        //         if (!res.authSetting['scope.userInfo']) {
        //             that.setData({
        //                 show_auth: true
        //             });
        //             wx.hideLoading()
        //         } else {
        //             //获取用户信息
        //             that.getUserInfo()
        //             // that.login()
        //         }
        //     }
        // })
    },
    // login
    login: function () {
        var that = this
        wx.showLoading({
            title: '登录中...',
        });
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                // app.globalData.userId = res.result.openid
                wx.setStorageSync('openid', res.result.openid)
                wx.hideLoading()
                wx.switchTab({
                    url: '/pages/express/express'
                })
            },
            fail: err => {
                console.log(err)
            }
        })
    },
    /**
     * 授权并获取用户信息 
     */
    getUserProfile: function () {
        // wx.showLoading({
        //     title: '加载中...',
        // });
        let that = this;
        wx.getUserProfile({
            desc: '登录',
            success: (res) => {
                console.log('getuserinfo', res);
                if (res.errMsg == 'getUserProfile:ok') {
                    // 可以将 res 发送给后台解码出 unionId
                    app.globalData.userInfo = res.userInfo
                    // console.log(app.globalData.userInfo)
                    app.setUserInfo(res.userInfo)
                    // 缓存
                    if (!wx.getStorageSync('userInfo')) {
                        wx.setStorageSync('userInfo', res.userInfo)
                    }
                    // wx.hideLoading()
                    wx.switchTab({
                        url: '/pages/express/express'
                    })
                    // 登录
                    that.login()
                } else {
                    console.log('未授权');
                    wx.navigateTo({
                        url: '/pages/login/login',
                    })
                }
            }
        })
    },

    /**
     * 监听用户点击授权按钮
     */
    // getAuthUserInfo: function (data) {
    //     // console.log('data', data)
    //     //console.log('data', data.detail.errMsg)
    //     if (data.detail.errMsg == "getUserInfo:ok") {
    //         this.setData({
    //             show_auth: false
    //         });
    //         // 获取用户信息
    //         // this.getUserInfo()
    //         // this.login()
    //     } else {
    //         this.setData({
    //             show_auth: true
    //         });
    //     }

    // },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
