var app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    professionWall: {},
    type: '',
    onCommentInputShow: false,
    reCommentInput: false,
    commentInfor: {},
    towImageWidth: app.globalData.towImageWidth//获取设备图片宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取事件对象 
    const eventChannel = this.getOpenerEventChannel();
    // 监听professionWall事件，获取上一页面通过eventChannel传到当前页面的数据
    eventChannel.on('professionWall', function (data) {
      // console.log(data)
      const type = data.type;
      const id = data.id;
      that.loadData(type, id);
    });
  },
  /**
   * 查看详情
   * @param {类型} type 
   * @param {标识} id 
   */
  loadData(type, id) {
    wx.cloud.callFunction({
      name: 'seeDateil',
      data:{
        type:type,
        id:id
      }
    }).then(res =>{
      console.log(res)
      this.setData({
        professionWall: res.result.list[0],
        type: type
      });
    }).catch(err =>{
      console.log(err)
    });
  },
  /** 
   * 删除墙或者话题
  */
  delete(e) {
    console.log(e)
    //const that = this;
    const id = e.currentTarget.dataset.topic._id;
    const type = e.currentTarget.dataset.topic.typeWall;
    //console.log(id)
    wx.showModal({
      title: '提示',
      content: '你确定删除吗?',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
          })
          if (type == 'wall') {
            db.collection('confessionContents').doc(id).remove({
              success: function (res) {
                wx.hideLoading();
                console.log(res);
                wx.navigateBack({
                  delta: 1
                });
              }
            })
          } else {
            db.collection('topics').doc(id).remove({
              success: function (res) {
                wx.hideLoading();
                wx.navigateBack({
                  delta: 1
                });
              }
            })
          }
        }
      }
    })
  },
  // 回复
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
      byCommenterId = item._openid
      openId = commentItem[Index].comment.commentId
    }
    // console.log(item._openid)
    this.setData({
      onCommentInputShow: true,
      reCommentInput: true,
      commentInfor: {
        byCommenter: byCommenter,
        commentId: commentId,
        typeWall: this.data.professionWall.typeWall,
        openid: openId,
        number: number,
        isBuilding: false,
        id: comId,
        // byCommenterId: byCommenterId,
      }
    })
  },
  //评论 组件调用页面的方法刷新页面
  onMyEvent: function (e) {
    const that = this;
    const item = that.data.professionWall;
    // console.log(that.data.id)
    const isEvent = true;
    this.loadData(item.typeWall, item._id)
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
    // console.log(app.globalData.userId)
    if (commenterId == app.globalData.userId) {
      comments.splice(index, 1);//删除这条评论
      if (!isChild) { //删除父评论时的评论数
        comments.forEach((value, index) => {
          number = number + value.childComment.length
        });
        number = number + comments.length
      }
      console.log(that.data.type,_id)
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
                type: that.data.type,
                isBuilding: !isChild,
                childComId: id
              }
            }).then(res => {
              wx.hideLoading()
              // console.log(that.data.type,_id)
              that.loadData(that.data.type, _id)
            }).catch(err => {
              console.log(err)
            })
          }
        }
      })
    }
  },
  // 点赞
  onPraise: function (e) {
    console.log(e)
    const that = this;
    const topicInfor = e.currentTarget.dataset.professioninfor;//获取点击的话题
    const type = topicInfor.typeWall;
    const praises = topicInfor.praises;
    const openId = app.globalData.userId//获取openid
    const praiser = app.globalData.userInfo;//点赞人
    var praiseInfor = {//点赞信息
      openId: openId,
      avatarUrl: praiser.avatarUrl,
      nickName: praiser.nickName
    }
    const praiseNum = topicInfor.praiseNum;//点赞数
    const id = topicInfor._id;
    // let content = '';
    if ('wall' == type) {  // 表白墙
      if (!topicInfor.isPraise) {//点赞
        // console.log(professions.isPraise)
        // var msgData = {
        //   objId: _id,
        //   messageContents: '@' + praiser.nickName + '点赞了你！',
        //   bymsg: byPraise,
        //   msg: praiseInfor,
        //   openId: openids,
        //   typeWall: 'wall',
        //   time: app.getnowtime()
        // }
        wx.cloud.callFunction({
          name: "praise",
          data: {
            professionId: id,
            praise: true,
            praiseInfor: praiseInfor,
          },
        }).then(res => {
          // console.log(res)
          if (!topicInfor.praises) {//如果没有就等于praiseInfor,否则添加到praise里
            topicInfor.praises = praiseInfor;
          } else {
            topicInfor.praises.push(praiseInfor);
          }
          topicInfor.isPraise = true;
          // profession[professionIndex] = professions;//更新墙数据
          that.setData({
            professionWall: topicInfor
          });
          // that.writeComment(msgData)//执行写入消息函数
        }).catch(err => { console.log(err) });
      } else {//取消点赞
        // console.log(professions.isPraise)
        // var msgData = {
        //   objId: _id,
        //   messageContents: '@' + praiser.nickName + '取消了点赞！',
        //   bymsg: byPraise,
        //   msg: praiseInfor,
        //   openId: openids,
        //   typeWall: 'wall',
        //   time: app.getnowtime()
        // }
        wx.cloud.callFunction({
          name: "praise",
          data: {
            professionId: id,
            praise: false,
          }
        }).then(res => {
          //把openID从praises中删掉
          const newPraises = [];
          topicInfor.praises.forEach((praise, index) => {
            //console.log(praise)
            if (praise.openId != openId) {
              newPraises.push(praise);
            }
          });
          // console.log(newPraises);
          topicInfor.praises = newPraises;
          //把点赞设置为false
          topicInfor.isPraise = false;
          //把修改后的数据设置到原来的data中
          // profession[professionIndex] = professions
          //把修改后的数据设置到data中
          this.setData({
            professionWall: topicInfor
          });
          // that.writeComment(msgData)//执行消息函数
        }).catch(err => {
          console.log(err)
        })
      }
    } else {//  话题
      if (!topicInfor.isPraise) {//没有点赞就点赞，否则取消点赞
        wx.cloud.callFunction({
          name: 'topicPraise',
          data: {
            topicWallId: id,
            praise: true,
            topicPraiser: praiseInfor,
            praiseNum: praiseNum
          },
          success: function (res) {
            //console.log(res)
            if (res.result.errMsg == 'document.update:ok') {
              if (!praises) {//判断是否有数据
                praises = praiseInfor;
              } else {
                praises.push(praiseInfor)
              }
              topicInfor.isPraise = true;
              topicInfor.praiseNum = topicInfor.praiseNum + 1;//点赞数加一
              // topicInfors[topicIndex] = topicInfor;//更新墙数据
              that.setData({
                professionWall: topicInfor
              });
            }
          },
          fail: function (err) {
            console.log(err)
          }
        })
      } else {//取消点赞
        wx.cloud.callFunction({
          name: 'topicPraise',
          data: {
            praise: false,
            topicWallId: id,
            // praiseNum: praiseNum
          }
        }).then(res => {
          // console.log(res)
          // 把点赞数据从中删除
          const newPraises = [];
          //循环praises ，删掉我的openId
          praises.forEach((praise, index) => {
            if (praise.openId != openId) {
              newPraises.push(praise)
            }
          });
          topicInfor.praises = newPraises//更新点赞数据
          topicInfor.praiseNum = newPraises.length;//更新点赞数
          topicInfor.isPraise = false;//设置为false
          // topicInfors[topicIndex] = topicInfor
          that.setData({//重新设置
            professionWall: topicInfor,
            // praiseNum:newPraises.length
          });
        }).catch(err => {
          console.log(err)
        });
      }
    }
  },
  // 分享
  shareBtn(e) {

  },
  // 查看图片
  seeImage(e) {
    console.log(e)
    const imgIndex = e.currentTarget.dataset.index;//图片索引
    const topicItem = e.currentTarget.dataset.professioninfor;//获取查看的数据
    const image = topicItem.images;//获取图片
    wx.previewImage({
      urls: image,
      current: image[imgIndex]
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