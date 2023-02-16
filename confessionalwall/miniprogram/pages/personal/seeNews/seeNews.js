const app = getApp()
const db = wx.cloud.database()//
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // messageTime:"",//消息时间
    onCommentInputShow: false,
    professionWall: {},
    towImageWidth: app.globalData.towImageWidth,//获取设备图片宽度
    commentInfor: "",
    id: ""//墙id,type,人openid
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options, isEvent) {
    var that = this;
    //获取事件对象 
    const eventChannel = this.getOpenerEventChannel();
    // 监听messageId事件，获取上一页面通过eventChannel传到当前页面的数据
    var _id;
    // new一个promise机制解决真机调试异步问题
    new Promise((resolve, reject) => {
      eventChannel.on('messageId', function (data) {
        _id = data
        resolve(_id)//传到then者的值
        // console.log(data)
        that.setData({
          id: _id
        })
      });
      // 评论之后执行
      if (isEvent) {
        resolve(options)
      }
      wx.showLoading({
        title: '加载中...',
      })
    }).then(res => {
      //console.log(res)
      wx.hideLoading();
      wx.cloud.callFunction({
        name: 'seeDateil',
        data: {
          type: res.type,
          id: res.msgId
        }
      }).then(res => {
        console.log(res)
        this.setData({
          professionWall: res.result.list[0],
          // type: type
        });
      }).catch(err => {
        console.log(err)
      });
    })


  },

  /**
   * 回复tap事件
   */
  relComment: function (e) {
    console.log(e)
    const Index = e.currentTarget.dataset.index;
    const item = e.currentTarget.dataset.item;
    const isChild = e.currentTarget.dataset.ischild;
    var commentId;
    var byCommenter;
    var number;
    var comId;
    var byCommenterId;
    if (isChild) {
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
      byCommenterId = item._openid
    }
    // console.log(item._openid)
    this.setData({
      onCommentInputShow: true,
      reCommentInput: true,
      commentInfor: {
        byCommenter: byCommenter,
        commentId: commentId,
        typeWall: this.data.professionWall.typeWall,
        openid: this.data.id.openId,
        number: number,
        isBuilding: false,
        id: comId,
        // byCommenterId: byCommenterId,
      }
    })
  },
  // 组件调用页面的方法刷新页面
  onMyEvent: function (e) {
    const that = this;
    // console.log(that.data.id)
    const isEvent = true;
    this.onLoad(that.data.id, isEvent)
  },
  // 删除评论
  delComment: function (e) {
    console.log(e)
    const that = this;
    const item = e.currentTarget.dataset.item;
    const index = e.currentTarget.dataset.index;
    const isChild = e.currentTarget.dataset.ischild; //点击的是否是子评论
    var comments;
    var commenterId;
    var id; //需要进行修改的墙或评论的标识
    var number = 0; //评论数
    var _id; //墙的——id
    if (isChild) {
      _id = item.id
      number = e.currentTarget.dataset.number - 1;
      comments = item.childComment;
      id = item._id;
      commenterId = comments[index].commentId;
    } else {
      _id = item._id
      comments = item.comments;
      id = comments[index]._id;
      commenterId = comments[index].comment.commentId;//获取评论者openid
    }
    console.log(app.globalData.userId)
    if (commenterId == app.globalData.userId) {
      comments.splice(index, 1);//删除这条评论
      if (!isChild) { //删除父评论时的评论数
        comments.forEach((value, index) => {
          number = number + value.childComment.length
        });
        number = number + comments.length
      }
      wx.showModal({
        title: '提示',
        content: '确定删除这条评论？',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '删除中...',
            });
            wx.cloud.callFunction({
              name: 'comments',
              data: {
                deleteComment: false,
                commentId: id,
                comment: comments,
                _id: _id,
                number: number,
                type: that.data.professionWall.typeWall,
                isBuilding: !isChild,
                childComId: id
              }
            }).then(res => {
              wx.hideLoading()
              // const that = this;
              //console.log(res)
              const isEvent = true;
              that.onLoad(that.data.id, isEvent)
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




})