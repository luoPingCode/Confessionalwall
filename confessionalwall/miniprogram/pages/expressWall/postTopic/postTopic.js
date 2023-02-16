// pages/home/post/post.js
const app = getApp();
// 1. 获取数据库引用
const db = wx.cloud.database()
import { getUUID, getExt } from "../../../utils/random";
Page({
     data: {
          modalName: null,
          canPost: true,
          fileList: [],//图片数组 
          disabled: false//是否禁用
     },


     //   选图  图片读取完成后
     afterReadImg(e) {
          //     console.log(e)
          const that = this
          const oldImage = that.data.fileList;
          const newImg = oldImage.concat(e.detail.file)
          //console.log(newImg)
          that.setData({
               fileList: newImg,
               //attachments:newImg
               disabled: true
          })
     },

     // 删除图片
     DelImg(e) {
          // console.log(e)
          const that = this;
          const imgList = that.data.fileList
          wx.showModal({
               title: '提示',
               content: '确定要删除吗？',
               cancelText: '取消',
               confirmText: '确定',
               success: res => {
                    if (res.confirm) {
                         imgList.splice(e.detail.index, 1);
                         this.setData({
                              fileList: imgList,
                              disabled: false
                         })
                    }
               }
          })
     },
     /** 提交 */
     post: function (e) {
          // console.log(e)
          const value = e.detail.value;
          const topicContent = value.content;//内容
          const topicName = value.getName;//话题名字
          const topicPrivate = value.switch;//是否匿名
          const userInfor = app.globalData.userInfo
          const autor = {//发布话题人
               nickName: userInfor.nickName,
               avatarUrl: userInfor.avatarUrl
          }
          var that = this
          // 时间
          const topicImg = that.data.fileList;
          var nowtime = new Date();
          this.setData({
               canPost: false
          });
          var topicAllContent = {
               topicAutor: autor,
               topicContent: topicContent,
               topicName: topicName,
               topicPrivate: topicPrivate,
               typeWall: 'topic',
               praises: [],
               topicTime: nowtime,
               viewNumber: '',
               transmit: [],
               topicCollect: [],
               praiseNum: 0,
               start: [],
               startNum: 0,
               images: [],
               commentsNum: 0
          }
          wx.showLoading({
               title: '发布中...'
          });
          //图片id list
          const fileIdList = [];
          if (topicImg.length > 0) {
               const today = new Date();
               const year = today.getFullYear();
               const month = today.getMonth() + 1;
               const day = today.getDate();
               const cloudPath = "topicImages/" + year + "/" + month + "/" + day + "/" + getUUID() + "." + getExt(topicImg[0].url);
               const fs = wx.getFileSystemManager(); //获取本地临时文件地址
               fs.readFile({
                    filePath: topicImg[0].url,
                    success(res) {
                         const buffer = res.data;
                         wx.cloud.callFunction({
                              name: 'imgSec',
                              data: { buffer }
                         }).then(res => {
                              if (res.result.res.errCode == 0) {
                                   wx.cloud.uploadFile({
                                        // 指定上传到的云路径
                                        cloudPath: cloudPath,
                                        // 指定要上传的文件的小程序临时文件路径
                                        filePath: topicImg[0].url,
                                        // 成功回调
                                        success: res => {
                                             that.setData({
                                                  canPost: true
                                             })
                                             wx.hideLoading();
                                             // 文件上传成功
                                             if (res.errMsg == "cloud.uploadFile:ok") {
                                                  var fileid = res.fileID
                                                  fileIdList.push(fileid);//添加到新数组中
                                                  if (fileIdList.length === topicImg.length) {
                                                       topicAllContent.images = fileIdList
                                                       that.topicPostContent(topicAllContent);
                                                  }
                                             } else {
                                                  wx.showToast({
                                                       title: res.errMsg,
                                                       icon: 'none'
                                                  });
                                                  setTimeout(function () {
                                                       wx.hideLoading();
                                                  }, 1500);
                                             }
                                        },
                                   });
                              } else {
                                   wx.showModal({
                                        title: '警告',
                                        content: '你上传的图片包含违法内容，请从新选择图片',
                                        showCancel: false
                                   });
                              }
                         }).catch(err => {
                              console.log(err);
                         });
                    }
               });
          } else {
               that.topicPostContent(topicAllContent);
          }
     },
     // 上传至数据库
     topicPostContent: function (data) {
          // 2. 构造添加语句
          // collection 方法获取一个集合的引用
          // where 方法传入一个对象，数据库返回集合中字段等于指定值的 JSON 文档。API 也支持高级的查询条件（比如大于、小于、in 等），具体见文档查看支持列表
          // get 方法会触发网络请求，往数据库取数据

          // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
          db.collection('topics').add({
               // data 传入需要局部更新的数据
               data: data,
               success: res => {
                    wx.showToast({
                         title: '发布成功！',
                    });
                    console.log(res)
                    setTimeout(function () {
                         wx.hideToast()
                         wx.switchTab({
                              url: '/pages/express/express',
                         })
                    }, 1200)
               },
               fail: console.error
          })
     },
     /**
      * 生命周期函数--监听页面加载
      */
     onLoad: function (options) { },

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