const app = getApp()
Page({
     /**
      * 页面的初始数据
      */
     data: {
          active: 0,
          icon: {
               normal: '../../../images/gaobai.png',
               active: '../../../images/huati.png',
               gaobai: '../../../images/gaobai1.png',
               huati: '../../../images/huati1.png'
          },
          myCollect: [], //收藏的内容
          startX: "",//手指触摸开始滑动的位置
          delBtnWidth: 80,//删除按钮宽度
          noNew: false,
          result: [],
          // checked: false, //复选框
          checkWidth: 25, //复选框宽度
          isTop: false,  //长按顶部出现
          longPressId: '', //长按id
          staly: '',//长按之后添加的复选框
          color: '',
          delCheck: '',
          delNumber: '',//删除量
          showNum: false, //是否展示删除数
          showTab: true, //tab
          // onChecked: "" ,//查看消息或者长按后勾选
          touchEOrCheck: "touchE",
          seeNew: "seeNew",
          type: 'wall' //收藏类型
     },
     /** 
      * 长按出现复选框
     */
     longPress(e) {
          console.log(e)
          const index = e.currentTarget.dataset.index; //获取长按的item
          // console.log(index)
          const that = this;
          var res = [];
          const checkWidth = that.data.checkWidth;
          const txtStyle = "left:" + checkWidth + "px";
          var list = that.data.myCollect;
          list.forEach(element => {
               element.txtStyle = txtStyle;
          });
          // console.log(res.concat(index.toString()))
          that.setData({
               myCollect: list,
               isTop: true,
               result: res.concat(index.toString()),
               longPressId: index,
               staly: 'padding-top: 55rpx ; padding-bottom: 95px',
               color: "color: rgb(220, 9, 9);",
               delCheck: "delCheck",
               delNumber: '1',
               showNum: true,
               showTab: false,
               touchEOrCheck: "onCheck",
               seeNew: "isLongPress"
          });
     },
     // 删除复选框选中的
     delCheck(e) {
          const that = this;
          const item = that.data.myCollect;
          const type = that.data.type;
          // console.log(item)
          const arrId = that.data.result;
          const arrid = arrId.map(Number); //将字符串数组转换为数字数组
          // console.log(arrid)
          var _ids = []
          arrid.forEach((index) => {
               // console.log(index)
               const _id = item[index]._id;
               _ids = _ids.concat(_id);
          });
          // console.log(_ids)
          wx.showModal({
               title: '提示',
               content: '你确定删除选中的数据吗？',
               success: function (res) {
                    wx.showLoading({
                         title: '删除中...',
                    });
                    if (res.confirm) {
                         wx.cloud.callFunction({
                              name: 'delCollect',
                              data: {
                                   ids: _ids
                              },
                              success: function (res) {
                                   wx.hideLoading();
                                   console.log(res)
                                   arrid.forEach((index) => {
                                        // console.log(index)
                                        const id = item[index].id;
                                        wx.cloud.callFunction({ //取消掉收藏样式
                                             name: 'start',
                                             data: {
                                                  isCollect: false,
                                                  type: type,
                                                  id: id
                                             },
                                             success: function (res) {
                                                  that.getMyCollect(type)
                                                  that.setData({
                                                       showTab: true,
                                                       staly: '',
                                                       seeNew: "seeNew"
                                                  })
                                             },
                                             fail: function (err) {
                                                  console.log(err)
                                             },
                                        });
                                   });

                              },
                              fail: function (err) {
                                   console.log(err)
                              }
                         });
                    }
               },
          });
     },
     isLongPress(e) {
          console.log(e)
          const index = e.currentTarget.dataset.index;
          this.onCheckGroup(index)
     },
     onCheck(e) { },
     /**
      * 查看
      * @param {点击时间} e 
      */
     seeNew(e) {
          console.log(e)
          const that = this;
          if (that.endTime - that.startTime < 350) {
               const collects = that.data.myCollect;
               console.log(collects)
               const index = e.currentTarget.dataset.index;
               const collect = collects[index]; // 获取收藏的数据
               const id = collect.id;
               const type = collect.startItem.typeWall;
               wx.navigateTo({
                    url: '../mycollect/seeCollect/seeCollect',
                    success: function (res) { //想被打开页面传数据
                         res.eventChannel.emit('collectDataId', {
                              id,
                              type
                         })
                    }
               })
          }
     },
     /** 
      * 复选框
     */
     onCheckGroup(e) {
          console.log(e)
          if (e.type) {
               const id = e.detail;
               if (id.length == 0) {
                    this.setData({
                         color: 'color:rgb(241, 170, 170)',
                         delCheck: '',
                         result: id,
                         showNum: false
                    })
               } else {
                    this.setData({
                         result: id,
                         color: "color: rgb(220, 9, 9);",
                         delCheck: "delCheck",
                         delNumber: id.length,
                         showNum: true
                    });
               }
          } else {
               // console.log(e)
               const id = e.toString()
               const result = this.data.result;
               // console.log(result)
               var newRes = result.concat(id);
               // console.log(newRes)
               if (result.length == 0) {
                    this.setData({
                         result: newRes,
                         color: "color: rgb(220, 9, 9);",
                         delCheck: "delCheck",
                         delNumber: "1",
                         showNum: true
                    });
               } else if (result.length == 1) {
                    const index = result[0]
                    if (id == index) {
                         this.setData({
                              result: [],
                              color: "color:rgb(241, 170, 170);",
                              delCheck: "",
                              // delNumber: "",
                              showNum: false
                         });
                    } else {
                         this.setData({
                              result: newRes,
                              color: "color: rgb(220, 9, 9);",
                              delCheck: "delCheck",
                              delNumber: newRes.length,
                              showNum: true
                         });
                    }
               } else {
                    var index = result.indexOf(id);//判断所点击的item是否在result数组中
                    if (index < 0) { //不在
                         // console.log(index)
                         const results = result.concat(id)
                         this.setData({
                              result: results,
                              color: "color: rgb(220, 9, 9);",
                              delCheck: "delCheck",
                              delNumber: results.length,
                              showNum: true
                         });
                    } else { //在
                         // console.log(index)
                         const newArr = []
                         result.forEach((indx) => {
                              if (id != indx) {
                                   newArr.push(indx);
                                   // console.log(newArr)
                                   this.setData({
                                        result: newArr,
                                        color: "color: rgb(220, 9, 9);",
                                        delCheck: "delCheck",
                                        delNumber: newArr.length,
                                        showNum: true
                                   });
                              }
                         });
                    }
               }
          }
     },
     /**
      * 全部勾选
      */
     allCheck(e) {
          console.log(e)
          const mycollect = this.data.myCollect;
          var index = []
          for (var i = 0; i < mycollect.length; i++) {
               index = index.concat(i.toString())
          }
          this.setData({
               result: index,
               showNum: true,
               delNumber: mycollect.length,
               color: "color: rgb(220, 9, 9)"
          })
     },
     /**
      * 取消勾选
      */
     cancel() {
          const that = this;
          const txtStyle = "left: 0px";
          var list = that.data.myCollect;
          list.forEach(element => {
               element.txtStyle = txtStyle;
          });
          that.setData({
               myCollect: list,
               isTop: false,
               result: [],
               staly: '',
               color: '',
               delCheck: '',
               delNumber: '',
               showTab: true,
               touchEOrCheck: "touchE",
               seeNew: "seeNew"
          })
     },
     /**
      * 底部标签栏
      * @param {索引} event 
      */
     onChange(event) {
          var type;
          this.setData({
               myCollect: [],
               isTop: false
          })
          const index = event.detail
          if (index) { // 收藏的话题
               type = 'topic'
               wx.showLoading({
                    title: '加载中...',
               })
               wx.cloud.callFunction({
                    name: 'myCollect',
                    data: {
                         type: 'topic'
                    },
                    success: res => {

                         if (res.result.data.length == 0) {
                              this.setData({
                                   noNew: true,
                                   isTop: false
                              })
                         } else {
                              this.setData({
                                   noNew: false
                              })
                         }
                         wx.hideLoading();
                         this.setData({
                              myCollect: res.result.data
                         })
                    },
                    fail: err => {
                         console.log(err)
                    }
               })
          } else { // 收藏的表白墙
               type = 'wall'
               this.getMyCollect("wall");
          }
          this.setData({
               active: index,
               type: type
          });
     },
     /**
      * 生命周期函数--监听页面加载
      */
     onLoad: function (options) {
          this.getMyCollect("wall")
     },
     /**
      * 收藏集合
      */
     getMyCollect(type) {
          wx.showLoading({
               title: '加载中...',
          })
          wx.cloud.callFunction({
               name: 'myCollect',
               data: {
                    type: type
               },
               success: res => {
                    wx.hideLoading();
                    console.log(res)
                    if (res.result.data.length == 0) {
                         this.setData({
                              noNew: true,
                              isTop: false
                         })
                    } else {
                         this.setData({
                              noNew: false
                         })
                    }
                    this.setData({
                         myCollect: res.result.data
                    });
               },
               fail: err => {
                    console.log(err)
               }
          })
     },
     /**
        * 手指开始触摸
       */
     touchS: function (e) {
          // console.log(e)
          this.startTime = e.timeStamp;
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
          // console.log(e)
          const that = this;
          if (e.touches.length == 1) {
               //手指移动时水平方向位置
               var moveX = e.touches[0].clientX;
               //手指起始点位置与移动期间的差值
               var disX = that.data.startX - moveX;
               var delBtnWidth = that.data.delBtnWidth;
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
               var list = that.data.myCollect;
               list[index].txtStyle = txtStyle;
               //更新列表的状态
               this.setData({
                    myCollect: list
               });
          }
     },
     /** 
      * 手指离开
     */
     touchE: function (e) {
          // console.log(e)
          const that = this;
          that.endTime = e.timeStamp;//手指离开时时间
          if (e.changedTouches.length == 1) {
               //手指移动结束后水平位置
               var endX = e.changedTouches[0].clientX;
               //触摸开始与结束，手指移动的距离
               var disX = that.data.startX - endX;
               var delBtnWidth = that.data.delBtnWidth;
               //如果距离小于删除按钮的1/2，不显示删除按钮
               if (that.endTime - this.startTime < 350) {
                    var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "px" : "left:0px";
                    //获取手指触摸的是哪一项
                    var index = e.currentTarget.dataset.index;
                    var list = that.data.myCollect;
                    list[index].txtStyle = txtStyle;
                    //更新列表的状态
                    this.setData({
                         myCollect: list
                    });
               }

          }
     },
     //获取元素自适应后的实际宽度
     getEleWidth: function (w) {
          var real = 0;
          const that = this;
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
     /**
      * 滑动删除
      */
     delItem(e) {
          const that = this;
          const type = that.data.type;
          const index = e.currentTarget.dataset.index;//删除索引
          console.log(e)
          const collect = that.data.myCollect;
          const item = collect[index]; // 需要删除的数据
          var id = [];
          wx.showModal({
               title: '温馨提示',
               content: '你确定要删除吗？',
               success: function (res) {
                    if (res.confirm) {
                         wx.showLoading({
                              title: '删除中...',
                         });
                         wx.cloud.callFunction({
                              name: 'delCollect',
                              data: {
                                   ids: id.concat(item._id),
                              }
                         }).then(res => {
                              wx.hideLoading();
                              that.getMyCollect(type);
                         }).catch(err => {
                              console.log(err)
                         })
                    }
               }
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
          const type = this.data.type;
          this.getMyCollect(type)
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