import { formatTime } from "../../../utils/formatDate";
const createSharePic = require('../../../utils/shareImg')
const app = getApp()
const db = wx.cloud.database();
Page({

     /**
      * 页面的初始数据
      */
     data: {
          towImageWidth: app.globalData.towImageWidth,
          showGeMoreLoadin: false,
          noData: false,//下滑无数据
          relComment: false,//辨别是评论还是回复
          show: false,//展示更多选择
          date: '',
          minDate: new Date(2020, 1, 1).getTime(),
          // maxDate: new Date(2019, 10, 1).getTime(),
          currentDate: new Date().getTime(),
          // searchDate:''
          onShow: false,
          onCommentInputShow: false, //评论框
          showPop: false, //展示时间选择器
          reCommentInput: false, //是否是回复
          shartOrShareTopic: '',
          showShare: false,//分享面板
          sharePicUrl: '',//自定义分享图片
          options: [
               [
                    { name: '微信', icon: 'wechat', openType: 'share' }
               ]
          ],
          shareItem: {},//转发的item
          transmits: '',//被分享内容
          leftList: [],
          rightList: [],
          leftHeight: 0,
          rightHeigt: 1,
     },
     /** 
      * 查看详情
     */
     seeDetail(e) {
          console.log(e)
          const id = e.currentTarget.dataset.objid;//获取所点击的墙索引
          wx.navigateTo({
               url: '../../../pages/sale/comment_sale/comment_sale?id=' + id
          })
     },
     // 搜索框聚焦
     onDisplay() {

          this.setData({
               showPop: true
          })
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
          db.collection('topics').where({
               _openid: app.globalData.userId,
               topicTime: new db.RegExp({
                    regexp: '^' + date,
                    //从搜索栏中获取的value作为规则进行匹配。
                    //options: 'm',
                    //大小写不区分
               })
          }).orderBy("topicTime", "desc").get({
               success: function (res) {
                    //console.log(res)
                    wx.hideLoading({
                         success: (res) => {
                              // wx.showToast({
                              //      title: '搜索成功！',
                              // })
                         },
                    })
                    const fessionDate = res.data
                    console.log(fessionDate)
                    that.setData({
                         topicProInfor: fessionDate,
                         onShow: true
                    })
               }
          })
     },
     // 点击遮罩层关闭
     onClose() {
          //console.log(1)
          this.setData({ showPop: false });
     },
     //日期选择弹出层 确认按钮
     onConfirm(e) {
          //console.log(e)
          this.setData({
               date: formatTime(e.detail),
               showPop: false,
               currentDate: e.detail,
               // searchDate:app.getnowtime
          })
     },
     //日期选择弹出层 取消按钮
     onCancel() {
          this.setData({
               showPop: false
          })
     },
     /** 
      * 更多取消页
     */
     // 关闭下拉菜单
     onCloseSheet() {
          this.setData({
               show: false
          })
     },
     // 取消按钮
     onCancelSheet() {
          this.onCloseSheet()
     },
     /**
      * 生命周期函数--监听页面加载
      */
     onLoad: function (options) {
          this.topicConfession(0);
          console.log("---------")
     },
     // 卖友墙
     topicConfession: function (start = 0) {
          const that = this;
          // console.log(start)
          const openid = app.globalData.userId
          wx.showLoading({
               title: '加载中...',
          })
          let leftList = this.data.leftList;
          let rightList = this.data.rightList;
          let leftHeight = this.data.leftHeight;
          let rightHeigt = this.data.rightHeigt;
          // 读取数据
          // 1. 获取数据库引用
          db.collection('saleFriend').where({
               _openid: openid
          }).get()
               .then(res => {
                    console.log(res)
                    if (res.errMsg == "collection.get:ok") {
                         const datalength = res.data.length
                         let item
                         let comment_number
                         for (var i = 0; i < datalength; i++) {
                              var data = res.data[i]
                              item = {
                                   "poster": data.poster,
                                   "id": data._id,
                                   "comment_number": data.comment_number,
                                   "praise_number": data.praise_number,
                                   "attachments": data.attachments
                              }
                              if (datalength >= 1) {
                                   if (leftList.length <= rightList.length) {
                                        leftList.push(item);
                                        leftHeight += data.attachments[0]['height'];
                                   } else {
                                        rightList.push(item)
                                        rightHeigt += data.attachments[0]['height'];
                                   }
                              }
                              console.log(leftList, rightList)
                              that.setData({
                                   leftList: leftList,
                                   rightList: rightList,
                                   leftHeight: leftHeight,
                                   rightHeigt: rightHeigt,
                              })
                         }
                    }
                    wx.hideLoading();
                    that.setData({
                         showGeMoreLoadin: false
                    });
               }).catch(err => {
                    {
                         console.log(err)
                    }
               })
          // wx.cloud.callFunction({
          //      name: 'myConfessionWall',
          //      data: {
          //           start: start,
          //           type: 'sale'
          //      },
          //      success: function (res) {
          //           console.log(res)
          //           const topicData = res.result//话题数据
          //           let newTopicInfor = [];
          //           if (start > 0) {//数据大于0，添加在数组后面
          //                newTopicInfor = that.data.topicProInfor.concat(topicData);

          //           } else {
          //                newTopicInfor = topicData
          //           }
          //           //console.log(newTopicInfor)
          //           that.setData({
          //                saleProInfor: newTopicInfor,
          //                showGeMoreLoadin: false,
          //                noData: true
          //           })
          //      }
          // })
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
          // console.log('-----')
          // this.topicConfession(0);
     },

     /**
      * 生命周期函数--监听页面隐藏
      */
     onHide: function () {

     },

     /**
      * 页面上拉触底事件的处理函数
      */
     onReachBottom: function () {
          this.setData({
               showGeMoreLoadin: true,
               noData: false
          })
          this.topicConfession(this.data.topicProInfor.length)

     },

     /**
      * 用户点击右上角分享
      */
     onShareAppMessage: function () {
          const that = this;
          const id = that.data.shareItem.shareId;
          var shareObj = {
               title: '页面分享',
               path: '/pages/express/express?_id' + id,
               imageUrl: this.data.sharePicUrl,
               success: function (res) {
                    console.log(res)
               }
          }
          return shareObj;
     }
})