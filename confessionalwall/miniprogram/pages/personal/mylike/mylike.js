const db = wx.cloud.database(); //初始化云函数
const app = getApp()
Page({

     /**
      * 页面的初始数据
      */
     data: {
          myLike: [],
          showCommentInput: false,
          content: '',
          objId: '',
          objType: '',
          // modelName: null
          index: ''
     },

     /**
      * 生命周期函数--监听页面加载
      */
     onLoad: function (options) {
          this.getMyLikeID()
     },
     /**
      * 得到我的喜欢
      */
     getMyLikeID() {
          const that = this;
          db.collection('myLike').where({ //根据用户id查询数据库
               _openid: app.globalData.userId
          }).field({ //返回需要的内容
               saleid: true
          }).get().then(res => {
               const resData = res.data;
               that.myLikeData(resData)
          }).catch(err => { console.log(err) });
     },
     /**
      * 从saleFriend中得到相应数据
      * @param {id} resData 
      */
     myLikeData(resData) {
          wx.showLoading({
               title: '加载中...',
          });
          wx.cloud.callFunction({
               name: 'mylike',
               data: {
                    resData: resData
               }
          }).then(res => {
               wx.hideLoading()
               this.setData({
                    myLike: res.result
               })
          })
     },
     // follow,喜欢
     follow: function (e) {
          var that = this
          var sale = that.data.myLike
          var userInfo = wx.getStorageSync('userInfo')
          var owneropenid = app.globalData.userId
          var praiser = {
               praisesName: userInfo.nickName,
               praiseOpenid: owneropenid,
               praiseUrl: userInfo.avatarUrl,
               id: that.data.objId
          }
          console.log(sale)
          // 判断是否已经follow
          if (!sale.follow) {
               // 没有follow，可以follow
               sale.follow = true
               sale.follower.push(praiser)
               // 保存到喜欢
               db.collection('myLike').add({
                    // data 字段表示需新增的 JSON 数据
                    data: {
                         userid: owneropenid,
                         saleid: that.data.objId
                    },
                    success(res) {
                         // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                         // console.log('mylike结果',res) 
                    },
                    fail: console.error
               })
          } else {
               // 已经follow，再次点击就取消follow
               sale.follow = false
               let index = sale.follower.indexOf(owneropenid)
               sale.follower.splice(index, 1)
               // 删除mylike
               wx.cloud.callFunction({
                    name: 'DeleteMyLike',
                    data: {
                         "id": that.data.objId,
                    },
                    success: (res => {
                         console.log(res)
                    }),
                    fail: console.err
               });

          }
          console.log(sale.follower)
          let newpraise_number = sale.follower.length
          sale.follow_number = newpraise_number
          // messagedata
          var mesdata = {
               objId: that.data.objId,
               messageContents: '@' + userInfo.nickName + ' 喜欢你朋友!',
               bymsg: sale.poster,
               msg: userInfo,
               openId: sale.posteropenid,
               typeWall: "sale",
               time: app.getnowtime()
          }
          // console.log(that.data.objId, newpraise_number, sale.follower)
          // 调用云函数,更改follow
          wx.cloud.callFunction({
               name: 'SaleZan',
               data: {
                    id: that.data.objId,
                    praise_number: newpraise_number,
                    praise: owneropenid,
                    praiseUrl: userInfo.avatarUrl,
                    praiseName: userInfo.nickName
               },
               success: res => {
                    // res 是一个对象， 其中有 _id 字段标记刚创建的记录的 id
                    //发送信息
                    // that.message(mesdata)
               },
               fail: err => { }
          })
          ////////////////
          this.setData({
               sale: sale
          })
     },
     /**
      * 获取评论框的输入内容
      */
     getCommentContent: function (event) {
          // console.log(event)
          let content = event.detail.value;
          this.setData({
               content: content
          })
     },
     /**
     * 显示评论输入框
     */
     showCommentInput: function (e) {
          let objid = e.currentTarget.dataset.objid;
          let type = e.currentTarget.dataset.type;
          let refId = e.currentTarget.dataset.refid;
          // console.log(e)
          // 显示输入评论
          // this.showModal()
          this.setData({
               modalName: e.currentTarget.dataset.target,
               showCommentInput: true,
               objId: objid,
               objType: type,
               index: refId,
               childComId: '',
               byCommenter: ''
          });
     },
     /**
     * 评论
     */
     postComment: function (e) {
          var that = this
          // 帖子类型ID
          this.isBuilding = true
          let objType = this.data.objType;
          const index = that.data.index;
          // 帖子ID
          let objId = this.data.objId;
          let byCommenter = that.data.byCommenter;
          // 评论内容
          let content = this.data.content;
          if (content == '') {
               wx.showModal({
                    title: '提示',
                    content: '请输入内容',
                    showCancel: false,
                    success(res) {
                         if (res.confirm) {

                         }
                    }
               });
               return
          }
          wx.showLoading({
               title: '发送中...',
          });
          // let refCommentId = this.data.refCommentId;
          // 已有评论
          const sale = this.data.myLike[index]
          let comments = sale.comments
          console.log(sale)
          const userInfor = {
               avatarUrl: app.globalData.userInfo.avatarUrl,
               nickName: app.globalData.userInfo.nickName
          }
          // 将当前评论加入到已有评论
          var newcomment = {
               commentId: app.globalData.userId,
               commenters: {
                    commenter: userInfor
               },
               time: app.getnowtime(),
               commentContent: content,
               byCommenters: {
                    byCommenter: byCommenter
               },
               comIndex: that.data.comIndex
          }
          var newCom = {
               id: sale._id,
               type: 'sale',
               childComment: [],
               comment: newcomment
          }
          comments.push(newCom)
          sale.comments = comments
          // 当前评论数
          var newcomment_number = comments.length
          sale.comment_number = newcomment_number

          console.log(newcomment_number)

          // 获取userInfo
          var userInfo = wx.getStorageSync('userInfo')
          var mesdata = {
               objId: objId,
               messageContents: '@' + userInfo.nickName + ' 来撩你舍友了!他说：' + content,
               bymsg: sale.poster,
               msg: userInfor,
               openId: sale.posteropenid,
               typeWall: "sale",
               time: app.getnowtime()
          }
          // 提交评论
          // 调用云函数
          wx.cloud.callFunction({
               name: 'comments',
               data: {
                    deleteComment: true,
                    commentId: objId,
                    comment: newcomment,
                    type: 'sale',
                    _id: objId,
                    number: newcomment_number,
                    childComId: that.data.childComId, //评论回复的_id
                    isBuilding: this.isBuilding //是否楼主
               },
               success: res => {
                    // res 是一个对象， 其中有 _id 字段标记刚创建的记录的 id
                    // console.log('praise', res)
                    console.log(comments, sale)
                    wx.hideLoading()
                    that.setData({
                         sale: sale,
                         comments: comments,
                         content: '',
                         showCommentInput: false
                    })
                    //发送信息
                    that.message(mesdata)
               },
               fail: err => {

               }
          })

     },
     // 关闭评论框
     hideModal(e) {
          this.setData({
               content: '',
               modalName: null
          })
     },
     /** 
      * 预览图片
      */
     previewImage: function (event) {
          let url = event.target.id;
          wx.previewImage({
               current: '',
               urls: [url]
          });
     },
     // 创建新的消息盒子
     message: function (data) {
          // 评论、点赞人昵称
          // var nickname = data.nickname
          // 评论、点赞人头像
          // var avatar = data.avatar
          const msger = data.msg;
          // 更新时间
          // var updatetime = app.getnowtime()
          // 评论、点赞内容
          // var content = data.content
          const msgContent = data.messageContents;
          // 接收的用户openid
          // var messageuser = data.messageuser
          const openId = data.openId;
          // 当前帖子id
          // var objId = data.objId
          const id = data.objId;
          // 帖子类型
          // var obj_type = data.obj_type
          // 接收者
          const bymsger = data.bymsg;
          // 添加消息
          db.collection('messageContent').add({
               data: {
                    objId: id,
                    bymessager: bymsger,
                    messager: msger,
                    msgContent: msgContent,
                    messageTime: data.time,
                    userId: openId,
                    typeWall: data.typeWall
               },
               success(res) {
                    // console.log('messageres',res)
               },
               fail: console.log
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