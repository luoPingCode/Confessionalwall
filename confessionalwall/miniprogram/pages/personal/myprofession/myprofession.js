import { formatTime } from "../../../utils/formatDate";
var app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    towImageWidth: app.globalData.towImageWidth,
    professionInfor: [],
    onCommentInputShow: false,
    commentInfor: "",//评论信息
    show: false,
    date: '',
    minDate: new Date(2020, 1, 1).getTime(),
    currentDate: new Date().getTime(),
    // searchDate:''
    onShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.initImageSize();
    this.loadExprees(0, 'load');
  },
  // touchstart(){

  // },
  // 搜索框聚焦
  onDisplay() {
    this.setData({
      show: true
    })
  },
  // 确认按钮
  onConfirm(e) {
    // console.log(e)
    this.setData({
      date: formatTime(e.detail),
      show: false,
      currentDate: e.detail,
      // searchDate:app.getnowtime
    })
  },
  // 取消按钮
  onCancel() {
    this.setData({
      show: false
    })
  },
  // 遮罩层关闭
  closeOverlay() {
    this.setData({
      show: false
    })
  },
  // 点击遮罩层关闭
  onClose() {
    //console.log(1)
    this.setData({
      show: false
    });
  },
  onSearch() {
    console.log(11)
  },
  // 搜索按钮
  onClick(e) {
    const that = this;
    const date = that.data.date;
    if (!date) {
      wx.showModal({
        cancelColor: 'cancelColor',
        title: '温馨提示',
        content: '请选择或输入日期',
        showCancel: false
      });
      return;
    }
    wx.showLoading({
      title: '正在查询...',
      mask: true
    })
    db.collection('confessionContents').orderBy("fessionTime", "desc").where({
      _openid: app.globalData.userId,
      fessionTime: new db.RegExp({
        regexp: '^' + date,
        //从搜索栏中获取的value作为规则进行匹配。
        //options: 'm',
        //大小写不区分
      })
    }).get({
      success: function (res) {
        //console.log(res)
        wx.hideLoading({
          success: (res) => {
            // wx.showToast({
            //   title: '搜索成功！',
            // })
          },
        })
        const fessionDate = res.data
        console.log(fessionDate)
        that.setData({
          professionInfor: fessionDate,
          onShow: true
        })
      }
    })
  },
  /**
   * 
   * 我的墙 
   */
  loadExprees: function (start = 0, msg) {
    const that = this;
    if (msg == 'document.remove:ok') {
      wx.showToast({
        title: '删除成功',
      })
    } else if (msg == 'load') {
      wx.showToast({
        title: '加载中...',
        mask: true,
        icon: 'loading'
      })
    }

    //执行墙云函数
    wx.cloud.callFunction({
      name: "myConfessionWall",
      data: {
        start: start,
        type: 'wall'
      }
    }).then(res => {
      console.log(res)
      wx.hideToast();
      const professionInfor = res.result.list;
      let newprofessionInfor = [];
      if (start > 0) {
        newprofessionInfor = that.data.professionInfor.concat(professionInfor);
      } else {
        newprofessionInfor = professionInfor
      }
      //console.log(newprofessionInfor)
      that.setData({
        professionInfor: newprofessionInfor,
        showGeMoreLoadin: false
      });
    })
  },
  seeImage: function (e) {
    //console.log(e)
    const index = e.currentTarget.dataset.index;//获取图片索引
    const professionIndex = e.currentTarget.dataset.professioninfor;//获取墙索引
    const image = this.data.professionInfor[professionIndex].images;//获取图片地址列表
    const current = image[index];//获取点击的图片地址
    wx.previewImage({
      urls: image,
      current: current
    })
  },
  /** 
   * 查看详情
  */
  seeDetail: function (e) {
    //console.log(e)
    const professionWall = e.currentTarget.dataset.professioninfor;//获取所点击的墙数据
    wx.navigateTo({
      url: '../../personal/seedetails/seedetails',
      success: function (res) {
        // 通过eventChannel向被打开页面传值
        res.eventChannel.emit('professionWall', {
          id: professionWall._id,
          type: professionWall.typeWall
        })
      }
    })
  },
  /**
   * 删除表白墙
   *  
   */
  delConfessionWall: function (e) {
    //console.log(e)
    var that = this;
    const professionWallId = e.currentTarget.dataset.professioninfor._id;//获取墙id
    //console.log(professionWallId)
    wx.showModal({
      title: '提示',
      content: '你确定要删除吗？',
      success: function (res) {
        if (res.confirm) {
          db.collection('confessionContents').doc(professionWallId).remove({
            success: function (e) {
              //console.log(e)
              const msg = e.errMsg;
              that.loadExprees(0, msg);
            }
          })
        }
      }
    })

  },
  /** 
   * 回复
  */
  reSay: function (e) {
    console.log(e)
    const Index = e.currentTarget.dataset.index;
    const item = e.currentTarget.dataset.item;
    const isChild = e.currentTarget.dataset.ischild;
    var commentId;
    var byCommenter;
    var number;
    var comId;
    var byCommenterId;
    var openId;
    if (isChild) {
      openId = item.childComment[Index].commentId
      commentId = item.id //需要修改的墙的评论数的id
      comId = item._id;
      byCommenter = item.childComment[Index].commenters.commenter;
      number = e.currentTarget.dataset.number;
      byCommenterId = ''
    } else {
      commentId = item._id;
      var commentItem = item.comments;
      byCommenter = commentItem[Index].comment.commenters.commenter;
      comId = commentItem[Index]._id;//被回复评论的_id
      number = item.commentsNum;
      byCommenterId = item._openid;
      openId = commentItem[Index].comment.commentId
    }
    console.log(number)
    this.setData({
      onCommentInputShow: true,
      reCommentInput: true,
      commentInfor: {
        byCommenter: byCommenter,
        commentId: commentId,
        typeWall: 'wall',
        openid: openId,
        number: number,
        isBuilding: false,
        id: comId,
        // byCommenterId: byCommenterId,
      }
    })
  },
  // 组件调用页面的方法刷新页面
  onMyEvent: function (e) {
    //console.log(e)
    this.loadExprees(0)
  },
  // 删除回复的内容
  delComment: function (e) {
    console.log(e)
    const that = this
    const index = e.currentTarget.dataset.index;//获取索引
    const isChild = e.currentTarget.dataset.ischild; //点击的是否是子评论
    const professions = e.currentTarget.dataset.item;
    var comments;
    var commenterId;
    var id; //需要进行修改的墙或评论的标识
    var number = 0; //评论数
    var _id; //墙的——id
    if (isChild) {
      _id = professions.id
      number = e.currentTarget.dataset.number - 1;
      comments = professions.childComment;
      id = professions._id;
      commenterId = comments[index].commentId;
    } else {
      _id = professions._id
      comments = professions.comments;
      id = comments[index]._id;
      commenterId = comments[index].comment.commentId;//获取评论者openid
    }
    if (commenterId == app.globalData.userId) {
      comments.splice(index, 1);//删除这条评论
      if (!isChild) { //删除父评论时的评论数
        comments.forEach((value, index) => {
          number = number + value.childComment.length
        });
        number = number + comments.length
      }
      console.log(number)
      wx.showModal({
        title: '提示',
        content: '您确定要删除回复的消息吗？',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '删除中...',
            })
            wx.cloud.callFunction({
              name: 'comments',
              data: {
                deleteComment: false,
                commentId: id,
                comment: comments,
                _id: _id,
                number: number,
                type: 'wall',
                isBuilding: !isChild,
                childComId: id
              }
            }).then(res => {
              wx.hideLoading()
              // Toast.clear()
              // console.log(res)
              const msg = 'document.remove:ok';
              that.loadExprees(0, msg)
            }).catch(err => {
              console.log(err)
            })
          }
        }
      })
    }
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
    this.loadExprees()
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