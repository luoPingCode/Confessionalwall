const db = wx.cloud.database();
const app = getApp();
var time = new Date()
Page({

     /**
      * 页面的初始数据
      */
     data: {
          placeholder: '请输入你想评论的话...',
          value: '',
          towImageWidth: app.globalData.towImageWidth,
          dataDateil: {}, //所查询到的数据
          width: (wx.getSystemInfoSync().windowWidth / 3) * 2,
          rightWidth: wx.getSystemInfoSync().windowWidth / 3,
          height: wx.getSystemInfoSync().windowHeight / 3 * 2,
          showPopup: false,
          isPraise: false, //点赞样式
          onCommentInputShow: false, //评论框出现
          toView: 'a0',
          scrollTop: 0,
          professionAuthor: '',
          commentId: '',
          byCommenterId: '',
          byCommenter: '',
          number: '',
          comIndex: '',
          reCommentInput: false,
          dataTwo: {}, //上一页面传过来的参数
          // isBuilding: true //是否楼主
          childComId: '', //修改评论的id
          showdel: false //展示弹出的删除按钮
     },

     /**
      * 生命周期函数--监听页面加载
      */
     onLoad: function (options) {
          const that = this;
          const eventChannel = this.getOpenerEventChannel();
          // 监听collectDataId事件，获取上一页面通过eventChannel传送到当前页面的数据
          eventChannel.on('collectDataId', function (data) {
               // console.log(data)
               that.setData({
                    dataTwo: data,
                    // showdel:false
               });
               that.getCollectDetail(data);
          });
     },
     // 得到收藏详情
     getCollectDetail(data) {
          const id = data.id;
          const type = data.type;
          console.log(data)
          wx.cloud.callFunction({
               name: 'seeDateil',
               data: {
                    type: type,
                    id: id
               }
          }).then(res => {
               console.log(res)
               this.setData({
                    dataDateil: res.result.list[0],
               });
          }).catch(err => {
               console.log(err)
          });
     },
     onClose() {
          this.setData({ showPopup: false });
     },
     // 评论图标点击事件
     iocnClick(e) {
          console.log(e)
          const professionWall = this.data.dataDateil;
          const type = professionWall.typeWall;
          var professionAuthor;
          if (type == 'topic') {//话题
               professionAuthor = professionWall.topicAutor
          } else {//表白墙
               //获取被评论的用户
               professionAuthor = professionWall.author;
          }
          this.isBuilding = true //是否楼主
          this.setData({
               professionAuthor: professionAuthor,
               commentId: professionWall._id,
               byCommenter: "",
               byCommenterId: professionWall._openid,
               comIndex: "",
               number: professionWall.commentsNum,
               showPopup: true,
               onCommentInputShow: true,
               placeholder: '请输入你想评论的话...',
               // isBuilding: true
          });
     },
     // 收藏事件
     startClick() {
          const that = this;
          const userInfo = app.globalData.userInfo;//收藏者
          const openId = app.globalData.userId;
          const userInfor = {//收藏者信息
               nickName: userInfo.nickName,
               avatarUrl: userInfo.avatarUrl,
               openId: openId
          }
          const wallData = that.data.dataDateil;
          const type = wallData.typeWall;
          var myStart;//写入的收藏数据
          var msgData;//写入的消息
          var isStart = true;
          if ('wall' == type) {//表白墙收藏
               //console.log(item)
               myStart = {
                    startItem: wallData,
                    startTime: app.getnowtime(),
                    id: wallData._id
               }
               msgData = {
                    objId: wallData._id,
                    messageContents: '@' + userInfo.nickName + '收藏了你的表白墙！',
                    bymsg: wallData.author,
                    msg: userInfor,
                    openId: wallData._openid,
                    typeWall: wallData.typeWall,
                    time: app.getnowtime()
               }
               wx.cloud.callFunction({
                    name: 'start',
                    data: {
                         id: wallData._id,
                         userInfo: userInfor,
                         isCollect: true,
                         startNum: wallData.startNum + 1,
                         type: wallData.typeWall
                    },
                    success: res => {
                         console.log(res)
                         if (!wallData.start) {
                              wallData.start = userInfor;
                         } else {
                              wallData.start.push(userInfor)
                         }
                         wallData.isStart = true;
                         // 更新墙数据
                         that.setData({
                              dataDateil: wallData
                         });
                         // console.log(msgData,myStart);
                         // that.writeComment(msgData);//消息函数
                         // that.myCollect(myStart, isStart);//收藏函数
                    },
                    fail: err => {
                         console.log(err)
                    }
               });
          } else {
               myStart = {
                    startItem: wallData,
                    startTime: app.getnowtime(),
                    id: wallData._id
               }
               msgData = {
                    objId: wallData._id,
                    messageContents: '@' + userInfo.nickName + '收藏了你的话题！',
                    bymsg: wallData.topicAutor,
                    msg: userInfor,
                    openId: wallData._openid,
                    typeWall: wallData.typeWall,
                    time: app.getnowtime()
               }
               wx.cloud.callFunction({
                    name: 'start',
                    data: {
                         id: wallData._id,
                         userInfo: userInfor,
                         isCollect: true,
                         startNum: wallData.startNum + 1,
                         type: wallData.typeWall
                    },
                    success: res => {
                         //console.log(res) 
                         if (!wallData.start) {
                              wallData.start = userInfor;
                         } else {
                              wallData.start.push(userInfor)
                         }
                         wallData.isStart = true;
                         // 更新墙数据
                         //  topicItem[e] = topic
                         //console.log(professions)
                         that.setData({
                              dataDateil: wallData,
                         });
                         // console.log(msgData,myStart);
                         // that.writeComment(msgData);//消息函数
                         // that.myCollect(myStart, isStart);//收藏函数
                    },
                    fail: err => {
                         console.log(err)
                    }
               });
          }
     },
     /**
   * 取消收藏
   * */
     yesStart(e) {
          const that = this;
          const startData = that.data.dataDateil;
          const userInfo = app.globalData.userInfo;//收藏者
          const openId = app.globalData.userId;
          var myStart;//写入的收藏数据
          var msgData;//写入的消息
          // var isStart = false;
          if ('wall' == startData.typeWall) {
               myStart = {
                    id: startData._id,
               }
               msgData = {
                    objId: startData._id,
                    messageContents: '@' + userInfo.nickName + '取消了收藏！',
                    bymsg: startData.author,
                    msg: userInfo,
                    openId: startData._openid,
                    typeWall: startData.typeWall,
                    time: app.getnowtime()
               }
               wx.cloud.callFunction({
                    name: 'start',
                    data: {
                         id: startData._id,
                         isCollect: false,
                         type: startData.typeWall
                    }
               }).then(res => {
                    //把openID从start中删掉
                    const newStart = [];
                    startData.start.forEach((str, index) => {
                         if (str.openId != openId) {
                              newStart.push(str);
                         }
                    });
                    startData.start = newStart;
                    //把点赞设置为false
                    startData.isStart = false;
                    that.setData({
                         dataDateil: startData
                    });
                    that.myCollect(myStart);
                    // that.writeComment(msgData)
               }).catch(err => { console.log(err) })
          } else {
               myStart = {
                    id: startData._id,
               }
               msgData = {
                    objId: startData._id,
                    messageContents: '@' + userInfo.nickName + '取消了收藏！',
                    bymsg: startData.topicAutor,
                    msg: userInfo,
                    openId: startData._openid,
                    typeWall: startData.typeWall,
                    time: app.getnowtime()
               }
               wx.cloud.callFunction({
                    name: 'start',
                    data: {
                         id: startData._id,
                         isCollect: false,
                         type: startData.typeWall
                    }
               }).then(res => {
                    //把openID从start中删掉
                    const newStart = [];
                    startData.start.forEach((str, index) => {
                         if (str.openId != openId) {
                              newStart.push(str);
                         }
                    });
                    startData.start = newStart;
                    //把点赞设置为false
                    startData.isStart = false;
                    that.setData({
                         dataDateil: startData,
                    });
                    that.myCollect(myStart);
                    // that.writeComment(msgData)
               }).catch(err => { console.log(err) })
          }

     },
     /**
   * 删除收藏集合
   *  
   */
     myCollect: function (data) {
          //console.log(data)
          const id = data.id
          new Promise((resovle, reject) => {
               db.collection('myCollect').where({
                    id: id
               }).field({
                    _id: true
               }).get({
                    success: function (res) {
                         //console.log(res)
                         resovle(res)
                    },
                    fail: function (err) {

                    }
               });//获取_id
          }).then(res => {
               // console.log(res)
               // 删除你收藏的东东
               db.collection('myCollect').doc(res.data[0]._id).remove({
                    success: function (res) {
                         wx.navigateBack()
                    }
               });
          });
     },
     /**
      * 点赞
      * */
     praiseClick(e) {
          const that = this;
          const wallData = that.data.dataDateil;//获取点击的墙
          const openId = app.globalData.userId//获取openid
          //console.log(openId)
          const type = wallData.typeWall;
          const openids = wallData._openid
          //console.log(professions._openid)
          //获取墙数据
          const praiser = app.globalData.userInfo;//点赞人

          var praiseInfor = {//点赞信息
               openId: openId,
               avatarUrl: praiser.avatarUrl,
               nickName: praiser.nickName
          }
          // console.log(professions)
          if (type == 'topic') {
               that.onPraiseTopic(wallData, praiseInfor, openId, openids)
          } else {
               const _id = wallData._id
               var byPraise = wallData.author;//被点赞人
               //如果以经点赞就不执行云函数
               if (!wallData.isPraise) {//点赞
                    // console.log(professions.isPraise)
                    var msgData = {
                         objId: _id,
                         messageContents: '@' + praiser.nickName + '点赞了你！',
                         bymsg: byPraise,
                         msg: praiseInfor,
                         openId: openids,
                         typeWall: 'wall',
                         time: app.getnowtime()
                    }
                    wx.cloud.callFunction({
                         name: "praise",
                         data: {
                              professionId: _id,
                              praise: true,
                              praiseInfor: praiseInfor,
                         },
                    }).then(res => {
                         // console.log(res)
                         if (!wallData.praises) {//如果没有就等于praiseInfor,否则添加到praise里
                              wallData.praises = praiseInfor;
                         } else {
                              wallData.praises.push(praiseInfor);
                         }
                         wallData.isPraise = true;
                         //  profession[professionIndex] = professions;//更新墙数据
                         that.setData({
                              dataDateil: wallData
                         });
                         that.writeComment(msgData)//执行写入消息函数
                    }).catch(err => { console.log(err) });
               } else {//取消点赞
                    // console.log(professions.isPraise)
                    var msgData = {
                         objId: _id,
                         messageContents: '@' + praiser.nickName + '取消了点赞！',
                         bymsg: byPraise,
                         msg: praiseInfor,
                         openId: openids,
                         typeWall: 'wall',
                         time: app.getnowtime()
                    }
                    wx.cloud.callFunction({
                         name: "praise",
                         data: {
                              professionId: _id,
                              praise: false,
                         }
                    }).then(res => {
                         //把openID从praises中删掉
                         const newPraises = [];
                         wallData.praises.forEach((praise, index) => {
                              //console.log(praise)
                              if (praise.openId != openId) {
                                   newPraises.push(praise);
                              }
                         });
                         // console.log(newPraises);
                         wallData.praises = newPraises;
                         //把点赞设置为false
                         wallData.isPraise = false;
                         //把修改后的数据设置到原来的data中
                         //  profession[professionIndex] = professions
                         //把修改后的数据设置到data中
                         this.setData({
                              dataDateil: wallData
                         });
                         that.writeComment(msgData)//执行消息函数
                    }).catch(err => {
                         console.log(err)
                    })
               }
          }
     },
     //话题点赞
     onPraiseTopic: function (topicInfor, praiser, openId, openids) {
          const that = this;
          const praises = topicInfor.praises;
          const praiseNum = praises.length;//点赞数
          const id = topicInfor._id;
          let content = '';
          // 处理异步问题
          new Promise((resovle, reject) => {
               if (!topicInfor.isPraise) {//没有点赞就点赞，否则取消点赞
                    wx.cloud.callFunction({
                         name: 'topicPraise',
                         data: {
                              topicWallId: id,
                              praise: true,
                              topicPraiser: praiser,
                              praiseNum: praiseNum
                         },
                         success: function (res) {
                              //console.log(res)
                              content = '@' + praiser.nickName + '给你点赞了！';
                              resovle(content);
                              if (res.result.errMsg == 'document.update:ok') {
                                   if (!praises) {//判断是否有数据
                                        praises = praiser;
                                   } else {
                                        praises.push(praiser)
                                   }
                                   topicInfor.isPraise = true;
                                   topicInfor.praiseNum = topicInfor.praiseNum + 1;//点赞数加一
                                   // topicAllInfor[topicIndex] = topicInfor;//更新墙数据
                                   that.setData({
                                        dataDateil: topicInfor
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
                         content = '@' + praiser.nickName + '取消了赞！';
                         resovle(content);//成功之后的数据
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
                         // topicAllInfor[topicIndex] = topicInfor
                         that.setData({//重新设置
                              dataDateil: topicInfor,
                              // praiseNum:newPraises.length
                         })
                    }).catch(err => {
                         console.log(err)
                    })
               }
          }).then(res => {
               // console.log(res)
               var msgData = {//消息数据
                    msg: praiser,
                    objId: id,
                    bymsg: topicInfor.topicAutor,
                    messageContents: res,
                    time: app.getnowtime(),
                    openId: openids,
                    typeWall: topicInfor.typeWall
               }
               that.writeComment(msgData);//执行消息方法
          }).catch(err => { console.log(err) })
     },
     /** 
    * 评论功能
   */
     formComment: function (e) {
          console.log(e)
          const that = this;
          const openId = app.globalData.userId;
          const userInfor = app.globalData.userInfo;//获取评论用户信息
          //console.log(openId,userInfor)
          const commentContent = e.detail.value.commentContent;//获取评论内容
          const professionAuthor = that.data.professionAuthor;
          // console.log(userInfor)
          const byCommenter = that.data.byCommenter;
          const relComment = that.data.relComment;
          const type = that.data.dataDateil.typeWall;
          const commentUser = {
               nickName: userInfor.nickName,
               avatarUrl: userInfor.avatarUrl
          }
          if (commentContent === "") {
               Toast('评论内容不能为空!')
               return
          }
          //存入消息集合的评论数据
          var byCommenters;
          var comContents;
          if (relComment) {
               comContents = '@' + userInfor.nickName + "回复了你：" + commentContent
               byCommenters = byCommenter
          } else {
               comContents = '@' + userInfor.nickName + "评论了你：" + commentContent
               byCommenters = professionAuthor
          }
          //console.log(time)
          var msgData = {
               objId: that.data.commentId,
               messageContents: comContents,
               bymsg: byCommenters,
               msg: userInfor,
               openId: that.data.byCommenterId,
               time: app.getnowtime(),
               typeWall: type
          }
          //存入墙的评论
          var newComments = {
               commentId: openId,
               commenters: {
                    commenter: commentUser
               },
               time: time,
               commentContent: commentContent,
               byCommenters: {
                    byCommenter: byCommenter
               },
               comIndex: that.data.comIndex
          }
          console.log(this.isBuilding)
          //执行评论云函数
          wx.cloud.callFunction({
               name: 'comments',
               data: {
                    deleteComment: true,
                    commentId: that.data.commentId,
                    comment: newComments,
                    type: type,
                    _id: that.data.commentId,
                    number: that.data.number + 1,
                    childComId: that.data.childComId,
                    isBuilding: this.isBuilding //是否楼主
               }
          }).then(res => {
               console.log(res)
               this.writeComment(msgData);
               that.getCollectDetail(that.data.dataTwo)
               this.setData({
                    onCommentInputShow: true,
                    professionAuthor: "",
                    commentId: "",
                    value: ''
               });

          }).catch(err => {
               console.log(err)
          })
     },
     /**
   * 回复tap事件
   */
     relComment: function (e) {
          console.log(e)
          const Index = e.currentTarget.dataset.index;
          const isChild = e.currentTarget.dataset.ischild;
          const item = e.currentTarget.dataset.item;
          var commentId;
          var byCommenter;
          var number;
          var comId;
          var byCommenterId;
          if (isChild) {
               commentId = e.currentTarget.dataset.id //需要修改的墙的评论数的id
               comId = item._id;
               byCommenter = item.childComment[Index].commenters.commenter;
               number = e.currentTarget.dataset.number;
               byCommenterId = item.childComment[Index].commentId
          } else {
               commentId = item._id;
               var commentItem = item.comments;
               byCommenter = commentItem[Index].comment.commenters.commenter;
               comId = commentItem[Index]._id;//被回复评论的_id
               number = item.commentsNum;
               byCommenterId = commentItem[Index].comment.comment
          }
          console.log(number, item)
          console.log(comId)
          this.isBuilding = false //是否楼主
          this.setData({
               onCommentInputShow: true,
               relComment: true,
               byCommenter: byCommenter,
               commentId: commentId,
               comIndex: Index,
               number: number,
               byCommenterId: byCommenterId,
               placeholder: '请输入你想回复他的话...',
               childComId: comId
          })
     },
     /**
   * 评论或点赞成功后，存入消息集合 
   */
     writeComment: function (data) {
          const id = data.objId;
          const bymsger = data.bymsg;
          const msger = data.msg;
          const msgContent = data.messageContents;
          const openId = data.openId;
          //console.log(data.time)
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
               success: function (res) {
                    // console.log(res)

               },
               fail: err => {
                    console.log(err)
               }
          })
     },
     // 长按事件
     longtap(e) {
          console.log(e)
          const index = e.currentTarget.dataset.index;
          const isChild = e.currentTarget.dataset.ischild; //点击的是否是子评论
          const dataCollect = e.currentTarget.dataset.item;
          if (isChild) {
               var num = e.currentTarget.dataset.number - 1;
          } //确定
          this.delComment(index, isChild, dataCollect, num)
     },
     /** 
   * 删除评论
  */
     delComment: function (index, isChild, collectData, num) {
          const that = this;
          var comments;
          var commenterId;
          var id; //需要进行修改的墙或评论的标识
          var number = 0; //评论数
          var _id; //墙的——id
          if (isChild) {
               _id = collectData.id
               number = num;
               comments = collectData.childComment;
               id = collectData._id;
               commenterId = comments[index].commentId;
          } else {
               _id = collectData._id
               comments = collectData.comments;
               id = comments[index]._id;
               commenterId = comments[index].comment.commentId;//获取评论者openid
          }
          console.log(number)
          const openId = app.globalData.userId;
          var type = that.data.dataDateil.typeWall;
          var isDel = "delete";
          if (commenterId == openId) {
               comments.splice(index, 1);//删除这条评论
               if (!isChild) { //删除父评论时的评论数
                    comments.forEach((value, index) => {
                         number = number + value.childComment.length
                    });
                    number = number + comments.length
               }
               wx.showModal({
                    title: '提示',
                    content: '确定删除此消息吗？'
               }).then(res => {
                    if (res.confirm) { //确定
                         // console.log(comments,number)
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
                                   type: type,
                                   isBuilding: !isChild,
                                   childComId: id
                              }
                         }).then(res => {
                              console.log(res)
                              wx.hideLoading();
                              that.getCollectDetail(that.data.dataTwo)
                              this.setData({
                                   onCommentInputShow: true,
                                   professionAuthor: "",
                                   commentId: "",
                                   value: ''
                              });

                         }).catch(err => {
                              console.log(err)
                         });
                    }
               }).catch(err => {
                    console.log(err)
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