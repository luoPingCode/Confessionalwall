const db = wx.cloud.database();//初始化云数据库
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startX: "",//手指触摸开始滑动的位置
    delBtnWidth: 80,//删除按钮宽度
    // txtStyle:"",//滑动的样式
    messageList: [], //消息列表
    noNew: false//显示是否有消息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMessageList()
  },

  /**
   * 获取消息列表 
   */
  getMessageList: function () {
    const that = this;
    const userId = app.globalData.userId;
    // console.log(userId);
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'news',
      data:'',
      success: function (res) {
        // console.log(res)
        wx.hideLoading()
        const msgList = res.result.data;
        if (msgList.length == 0) {
          that.setData({
            noNew: true
          })
        } else {
          //   msgList.forEach((message,index) => {//把时间转换为毫秒数的时间
          //   // console.log(message)
          //   message.messageTime = message.messageTime.getTime();
          // })
          // console.log(msgList)
          that.setData({
            messageList: msgList
          })
        }

      },
      fail: err => {
        console.log(err)
      }
    });

  },

  /**
   * 手指开始触摸
  */
  touchS: function (e) {
    //console.log(e)
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX
      })
    }
  },
  /**
   * 手指滑动中
  */
  touchM: function (e) {
    //console.log(e)
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var txtStyle = "";
      if (disX == 0 || disX < 0) {//如果移动距离等于小于0，说明右滑，则不变
        txtStyle = "left:0px";
      } else if (disX > 0) {//如果移动距离大于0，则left等于手指移动距离
        txtStyle = "left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + delBtnWidth + "px";
        }
      }
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = this.data.messageList;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        messageList: list
      });
    }
  },
  /** 
   * 手指离开
  */
  touchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "px" : "left:0px";
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = this.data.messageList;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        messageList: list
      });
    }
  },
  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);//以宽度750px设计稿做宽度的自适应
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  //点击删除按钮事件
  delItem: function (e) {
    const that = this;
    //获取列表中要删除项的下标
    const index = e.currentTarget.dataset.index;
    //console.log(e)
    const messageList = that.data.messageList;
    //console.log(messageList)
    const _id = messageList[index]._id;
    console.log(_id)
    wx.showLoading({
      title: '删除中...',
    })
    wx.cloud.callFunction({
      name:'delMessage',
      data: {
        id:_id,
        allDelete:false
      }
    }).then(res =>{
      wx.hideLoading();
      // console.log(res)
      that.getMessageList()
    }).catch(err =>{
      console.log(err)
    })
     
  },
  /** 
   * 查看消息
  */
  seeNew: function (e) {
    console.log(e)
    const index = e.currentTarget.dataset.index;
    const messageList = this.data.messageList;
    const messageId = {
      msgId: messageList[index].objId,
      type: messageList[index].typeWall,
      openId:messageList[index]._openid
    }
    //获取点击的消息的objId
    // const msgTime = messageList[index].commentTime//获取消息时间
    console.log(messageList)
    wx.navigateTo({
      url: '../seeNews/seeNews',
      success: function (res) {
        // 通过eventChannel向被打开页面传值
        res.eventChannel.emit('messageId', messageId)
      }
    })
  },
  /** 
   * 清空事件
  */
  clearNews: function () {
    const that = this;
    wx.showModal({
      title: '提示',
      content: '确定要清空所有消息吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '清空中...',
          })
          wx.cloud.callFunction({
            name: 'delMessage',
            data:{
              allDelete:true
            }
          }).then(res => {
            wx.hideLoading()
            // console.log(res)
            that.setData({
              noNew: true,
              messageList: ""
            })
          }).catch(console.error)
        }
      },
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },


})