import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const app = getApp();
var time = new Date();
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    inputShow: {//展示评论组件
      type: Boolean,
      value: true
    },
    commentInfor: {//评论内容
      type: Object,
      value: ""
    },
    reCommentShow: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击遮罩层关闭评论框
    closeCommentInput: function () {
      this.setData({
        inputShow: false,
        //professionAuthor: "",
        commentInfor: ""
      });
    },
    // 评论
    formComment: function (e) {
      const that = this;
      // console.log(this.properties.reCommentShow)
      // console.log(e.detail)
      const commentInfo = that.data.commentInfor;
      //console.log(commentInfo)
      const openId = app.globalData.userId;
      const userInfor = app.globalData.userInfo;//获取评论用户信息
      console.log(userInfor)
      const commentContent = e.detail.value.commentContent;//获取评论内容

      const byCommenter = commentInfo.byCommenter;//被回复者
      const typeWall = commentInfo.typeWall;//获取墙的类型
      const commentId = commentInfo.commentId;
      if (commentContent === "") {
        Toast({
          message: '评论内容不能为空!',
          context: this
        })
        return
      }
      //存入消息集合的评论数据
      var comContents;
      comContents = '@' + userInfor.nickName + "回复了你：" + commentContent
      //console.log(time)
      var msgData = {
        commentId: commentId,
        commentContents: comContents,
        byCommenter: byCommenter,
        commenter: userInfor,
        openId: commentInfo.openid,
        time: app.getnowtime(),
        typeWall: typeWall
      }
      //存入墙的评论
      var newComments = {
        commentId: openId,
        commenters: {
          commenter: userInfor
        },
        time: time,
        commentContent: commentContent,
        byCommenters: {
          byCommenter: byCommenter
        },

      }
      //执行评论云函数
      wx.cloud.callFunction({
        name: 'comments',
        data: {
          deleteComment: true,
          commentId: commentId,
          comment: newComments,
          type: typeWall,
          _id: commentId,
          number: commentInfo.number + 1,
          isBuilding: commentInfo.isBuilding,
          childComId: commentInfo.id
        }
      }).then(res => {
        Toast.success({
          message: '评论成功',
          context: this
        });
        this.triggerEvent('myevent', {})// 触发 myevent事件
        this.writeComment(msgData);

        this.setData({
          inputShow: false,
          //professionAuthor:"",
          commentInfor: ""
        })

      }).catch(err => {
        console.log(err)
      })
    },
    /**
     * 评论或点赞成功后，存入消息集合 
     */
    writeComment: function (data) {
      const id = data.commentId;
      const byCommeter = data.byCommenter;
      const commenter = data.commenter;
      const commentContent = data.commentContents;
      const openId = data.openId;
      //console.log(data.time)
      db.collection('messageContent').add({
        data: {
          objId: id,
          bymessager: byCommeter,
          messager: commenter,
          msgContent: commentContent,
          messageTime: data.time,
          userId: openId,
          typeWall: data.typeWall
        },
        success: function (res) {
          // console.log(res)

        }
      })
    }
  },

})
