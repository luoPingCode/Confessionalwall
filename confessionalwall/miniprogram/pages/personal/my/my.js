const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:"",
    nickName:"",
    hasUserInfo: true ,
    //canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  /**
   * 
   * 登录按钮
   */
  getUserInfo:function(e){
     //console.log(e);
     const userInfo = e.detail.userInfo;
     if(userInfo){
       app.setUserInfo(userInfo)
     }
    const userInfor = app.globalData.userInfo;
    this.login(userInfor)
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const user = wx.getStorageSync('userInfo');//获取缓存用户信息
    //console.log(user)
    //console.log(userInfo)
    if(user){
      app.setUserInfo(user)
    }else{
      //console.log('ll')
      this.setData({
        hasUserInfo:true
      })
    }
    const userInfor = app.globalData.userInfo;
    this.login(userInfor);
  },
  /** 
   * 登录
  */
  login:function(userInfor){
   // const userInfor = app.globalData.userInfo;
    //console.log(userInfor)
    var avatarUrl =" ";
    var nickname =" ";
    if(userInfor){
      avatarUrl = userInfor.avatarUrl,
      nickname = userInfor.nickName
      this.setData({
        avatarUrl:avatarUrl,
        nickName:nickname,
        hasUserInfo:false
      })
    }
  },
  bindViewTap:function(e){
    //console.log(e)
    //const index = e.currentTarget.dataset.index
    //const current = e.currentTarget.dataset.image
    const avatar = e.currentTarget.dataset.image;
    console.log(avatar)
    wx.previewImage({
      urls:[avatar],
      current: avatar
    })
  },
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})