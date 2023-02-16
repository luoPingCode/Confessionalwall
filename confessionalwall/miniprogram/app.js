//app.js
App({
  onLaunch: function () {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'lp-baoq8',
        traceUser: true,
      })
    }
    this.globalData = {
      param: false,
    }

    this.loadUserInfo();

    this.initImageSize();
  },
  // 获取当前时间
  getnowtime: function () {
    var date = new Date
    var year = date.getFullYear().toString()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    if (hour.toString().length === 1) {
      hour = '0' + hour.toString()
    } else if (minute.toString().length === 1) {
      minute = '0' + minute.toString()
    } else if (second.toString().length === 1) {
      second = '0' + second.toString()
    }

    var nowtime = year + '-' + month.toString() + '-' + day.toString() + ' ' + hour + ":" + minute + ":" + second
    return nowtime
  },

  /**
  * 通过手机宽度设置图片宽度
  */
  initImageSize: function () {
    const PhoneWidth = wx.getSystemInfoSync().windowWidth;
    // console.log(PhoneWidth);
    const contentWidth = PhoneWidth - 40;
    const towImageWidth = (contentWidth - 2.5) / 2;
    this.globalData.towImageWidth = towImageWidth
  },
  /**
   * 是否登录
   */
  is_login: function () {
    if (this.globalData.userInfo) {
      return true;
    } else {
      return false;
    }
  },
  setUserInfo: function (userInfo) {
    // console.log(userInfo)
    this.globalData.userInfo = userInfo;
  },
  loadUserInfo: function () {
    const that = this;
    // wx.getUserInfo({
    //   success: res => {
    //     const userInfo = res.userInfo;
    //     that.globalData.userInfo = userInfo;
    //   }
    // });
    wx.cloud.callFunction({
      name: "login",
      success: res => {
        //  console.log(res)
        const openId = res.result.openid;;
        that.globalData.userId = openId;
      }
    });
  }
})
