import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
const createSharePic = require('../../utils/shareImg')
const app = getApp();
const db = wx.cloud.database();
var time = new Date()
Page({


  /**
   * 页面的初始数据
   */
  data: {
    towImageWidth: app.globalData.towImageWidth,
    showGeMoreLoadin: false,
    professionInfor: [],
    mask: false,
    onCommentInputShow: false,
    professionAuthor: "",
    commentId: "",
    reCommentInput: false,
    professionWall: "",
    byCommenter: "",
    topName: "a",
    relComment: false,//辨别是评论还是回复
    byCommenterId: "",//被评论者openid
    comIndex: "",//评论的索引
    showShare: false,
    options: [
      [
        { name: '微信', icon: 'wechat', openType: 'share' }
      ]
    ],
    sharePicUrl: '',//自定义分享图片
    // 排序条件
    option2: [
      { text: '点赞', value: 'a', icon: 'like-o' },
      { text: '评论', value: 'b', icon: 'chat-o' },
      { text: '转发', value: 'c', icon: 'share-o' },
    ],
    value2: 'a',
    // topicProInfor: [],//话题墙数据
    hotTopic: {},//最热话题
    shareItem: {},//被分享的相关信息
    transmits: '',//被分享内容
    show: false, //下拉菜单
    actions: [
      {
        name: '',
        color: ''
      }, {
        name: ''
      }
    ],
    shartOrShareTopic: '',//收藏或转发的话题
    number: 0, //评论数
    sort: 'a', //最热排序
    childComId: '', //父评论d的_id  子评论
    // searchFriend: [] //找人表白墙
    noData:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadExprees(0, "", "load")
    //console.log(options)
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      success: function (res) {
        //console.log(res)
      }
    })
  },

  /**
   * 加载全部墙数据 
   */
  loadExprees: function (start = 0, isHot, isDel) {
    const that = this;
    if (start > 0) {

    } else {
      if ("delete" == isDel) {
        Toast.success('删除成功');
      } else if ("load" == isDel) {
        Toast.loading({
          message: '加载中...',
          forbidClick: true
        })
      } else {

      }
    }
    if (isHot) {
      var sort = that.data.sort
    }
    //执行墙云函数
    wx.cloud.callFunction({
      name: "professions",
      data: {
        start: start,
        isHot: isHot,
        condition: sort
      },
      success: function (res) {
        Toast.clear();
        const professionInfor = res.result.professions;
        // console.log(res)
        let newprofessionInfor = [];
        if (start > 0) {
          newprofessionInfor = that.data.professionInfor.concat(professionInfor);
        } else {
          newprofessionInfor = professionInfor
        }
        // console.log(newprofessionInfor)
        that.setData({
          professionInfor: newprofessionInfor,
          showGeMoreLoadin: false
        });
        // if(professionInfor.length == 0){
        //   that.setData({
        //     noData: true
        //   })
        // }
      }
    })
  },
  /** 
   * 上拉加载更多
  */
  onReachBottom: function () {
    this.setData({
      showGeMoreLoadin: true
    })
    let name = this.data.topName;
    if(name == 'a' || name=='c'){
      console.log(name)
      this.loadExprees(this.data.professionInfor.length);
    }else if(name == 'b' || name == 'd' || name=='e' || name=='f'){
      console.log(name)
      this.searchFriend(this.data.professionInfor.length,name)
    }
  },
  /**
   *顶部导航栏
   */
  onClick(e) {
    const that = this;
    var name = e.detail.name;
    // console.log(name)
    that.setData({
      professionInfor: [],
      topName: name
    })
    // console.log(name)
    if (name === 'a') {
      that.loadExprees(0, false);
    } else if (name == 'c') {
      that.setData({
        professionInfor: [],
        topName: "c",
        value2: 'a'
      })
      that.loadExprees(0, true);

    } else{
      that.searchFriend(0, name);
      that.setData({
        topName: name
      })
    }
  },
  // 找人
  searchFriend(start, name) {
    console.log(start, name)
    const that = this;
    Toast.loading({
      message: '加载中...',
      forbidClick: true
    });
    new Promise((resovle, reject) => { //解决异步
      // var  confessionType;
      if ('b' == name) {
        resovle('confession')
      } else if ('d' == name) { //读友
        resovle('readFriend');
      } else if ('e' == name) { //情侣
        resovle('lovers');
      } else { // 其他
        resovle('other');
      }
    }).then((res) => {
      console.log(res) 
      // Toast.clear();
      wx.cloud.callFunction({
        name: 'searchF',
        data: {
          confessionType: res,
          start: start
        },
        success: function (res) {
          console.log(res)
          Toast.clear();
          const data = res.result;
          let newprofessionInfor = [];
          if (start > 0) {
            newprofessionInfor = that.data.professionInfor.concat(data);
          } else {
            newprofessionInfor = data
          }
          that.setData({
            professionInfor: newprofessionInfor,
            showGeMoreLoadin: false
          });
          // if(data.length == 0){
          //  that.setData({
          //    noData: true
          //  });
          // }
        },
        fail: function (err) {
          console.log(err)
        }
      });
    });
  },
  // 点击遮罩层关闭评论框
  closeCommentInput: function () {
    this.setData({
      onCommentInputShow: false,
      professionAuthor: "",
      commentId: "",
      byCommenter: ""
    });
  },
  /**
   * 首页表白按钮
   */
  publish: function (e) {
    const that = this;
    if (app.is_login()) {
      // //  console.log("成功");
      // if (that.data.topName == 'b') {
      //   wx.navigateTo({
      //     url: '../expressWall/postTopic/postTopic',
      //   })
      // } else {
      wx.navigateTo({
        url: '../expressWall/send/send',
      });
      //   }
      // } else {
      //   wx.navigateTo({
      //     url: '../expressWall/authorization/authorization',
      //   })
    }
  },
  /** 
   * 下拉刷新
  */
  onPullDownRefresh: function () {
    const topName = this.data.topName;
    //console.log(topName)
    if (topName == 'a') {
      this.loadExprees(0, false, false);
    } else if (topName == 'c') {
      this.loadExprees(0, true, false)
    } else {
      this.searchFriend(0, topName)
    }
    wx.stopPullDownRefresh()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /** 
   *首页图片预览
  */
  seeImage: function (e) {
    const dataSet = e.target.dataset;
    const professions = dataSet.professioninfor;//获取墙索引
    const imagesIndex = dataSet.index;//获取图片索引
    const topName = this.data.topName
    var images;
    if (topName == 'b') {
      images = this.data.topicProInfor[professions].images
    } else {
      images = this.data.professionInfor[professions].images;//获取墙图片
    }
    // console.log(images,curr)
    const curr = images[imagesIndex];//获取图片地址
    wx.previewImage({
      urls: images,
      current: curr
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this
    const topName = that.data.topName;
    //console.log(topName)
    if (topName == 'a') {
      this.loadExprees(0, false, "");
    } else if (topName == 'c') {

      this.loadExprees(0, true, "");
    } else {
      that.searchFriend(0, topName);
    }
  },
  // 最热排序条件方法
  sortChange(e) {
    // console.log(e)
    const that = this;
    const hotSort = e.detail;//排序条件
    var sort = ''
    if (hotSort == 'a') {
      sort = hotSort
    } else if (hotSort == 'b') {
      sort = hotSort
    } else {
      sort = hotSort
    }
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
      loadingType: 'spinner',
    });
    that.setData({
      professionInfor: []
    })
    // console.log(sort)
    wx.cloud.callFunction({
      name: 'professions',
      data: {
        start: 0,
        isHot: true,
        condition: sort
      }
    }).then(res => {
      // console.log(res)
      Toast.clear();
      const professions = res.result.professions;
      that.setData({
        professionInfor: professions,
        sort: sort
      })
    }).catch(err => {
      console.log(err)
    })
  },
  // 分享事件
  shareBtn: function (e) {
    //console.log(e)
    const that = this;
    var item;
    var imgs;
    var shareitem;
    var avatar;//分享头像
    var name;//分享名字
    var time;//分享时间
    var content;//分享内容
    var person;//分享题目或人
    if (e.type) {
      item = e.currentTarget.dataset.item
      imgs = item.images;
      avatar = item.author.avatarUrl,
        name = item.author.nickName,
        time = item.fessionTime,
        content = item.content,
        person = item.favoritePerson
      shareitem = {
        shareId: item._id,
        byShareAuthor: item.author,
        typeWall: item.typeWall,
        openId: item._openid
      }
    } else {
      const topic = that.data.topicProInfor;
      item = topic[e]
      console.log(item)
      imgs = item.images
      avatar = item.topicAutor.avatarUrl,
        name = item.topicAutor.nickName,
        time = item.topicTime,
        content = item.topicContent,
        person = item.topicName
      shareitem = {
        shareId: item._id,
        byShareAuthor: item.topicAutor,
        typeWall: item.typeWall,
        openId: item._openid
      }
    }
    //console.log(shareitem)
    // 解决异步问题
    new Promise((resovle, reject) => {
      if (imgs != undefined) {
        // imgs.forEach(image =>{
        wx.getImageInfo({
          src: imgs[0],
          success: function (res) {
            //console.log(res)
            resovle(res.path)
          }
        })
        // })
      } else {
        resovle()
      }
    }).then(res => {
      createSharePic.createSharePicUrl(this,
        avatar,
        name,
        time,
        person,
        content,
        res, () => {
          wx.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            x: 0,
            y: 0,
            width: 250,
            height: 200,
            success(res) {
              //console.log(res);
              that.setData({
                sharePicUrl: res.tempFilePath,
              });
            },
          }, that);
        });

    }).catch(err => { console.log(err) })
    this.setData({
      showShare: true,
      shareItem: shareitem,
      transmits: item.transmit
    })
  },
  // 取消按钮
  onClose() {
    this.setData({
      showShare: false,
      sharePicUrl: ''
    });
  },
  // 分享
  onSelect(event) {
    // console.log(event)
    const that = this;
    const shareItem = that.data.shareItem;
    const sharer = app.globalData.userInfo;//分享者

    const shareLength = that.data.transmits.length;
    // console.log(shareLength)
    var sharers = {
      avatarUrl: sharer.avatarUrl,
      nickName: sharer.nickName
    }
    //console.log(sharer)
    var content;
    if (shareItem.typeWall == 'wall') {
      content = '@' + sharer.nickName + '转发了你的表白墙'
    } else {
      content = '@' + sharer.nickName + '转发了你的话题'
    }
    //console.log(content)
    var msgData = {//消息数据
      msg: sharers,
      objId: shareItem.shareId,
      bymsg: shareItem.byShareAuthor,
      messageContents: content,
      time: app.getnowtime(),
      openId: shareItem.openId,
      typeWall: shareItem.typeWall
    }
    wx.cloud.callFunction({
      name: 'share',
      data: {
        id: shareItem.shareId,
        typeWall: shareItem.typeWall,
        transmit: sharers,
        shareNum: shareLength + 1
      }
    }).then(res => {
      //console.log(res)
      if (that.data.topName == 'c') {
        that.loadExprees(0, true);
      } else if (that.data.topName == 'a') {
        that.loadExprees(0, false)
      } else {
        // that.topicConfession(0)
      }

      //调用分享方法
      that.writeComment(msgData);
    }).catch(err => {
      console.log(err)
    })
    this.onClose();
  },
  // 分享遮罩层
  onOverlay() {
    this.setData({
      showShare: false,
      sharePicUrl: ''
    })
  },
  onShareAppMessage: function (res) {
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
  },
  // 右上角图标
  // 收藏
  shart(e) {
    const that = this;
    const userInfo = app.globalData.userInfo;//收藏者
    console.log(userInfo)
    const openId = app.globalData.userId;
    console.log(openId)
    const userInfor = {//收藏者信息
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      openId: openId
    }
    const professions = that.data.professionInfor;
    var myStart;//写入的收藏数据
    var msgData;//写入的消息
    var isStart = true;
    if (e.type) {//表白墙收藏
      const index = e.currentTarget.dataset.index;
      const item = professions[index];
      //console.log(item)
      myStart = {
        startItem: item,
        startTime: app.getnowtime(),
        id: item._id
      }
      msgData = {
        objId: item._id,
        messageContents: '@' + userInfo.nickName + '收藏了你的表白墙！',
        bymsg: item.author,
        msg: userInfor,
        openId: item._openid,
        typeWall: item.typeWall,
        time: app.getnowtime()
      }
      wx.cloud.callFunction({
        name: 'start',
        data: {
          id: item._id,
          userInfo: userInfor,
          isCollect: true,
          startNum: item.start.length + 1,
          type: item.typeWall
        },
        success: res => {
          //console.log(res) 
          if (!item.isStart) {
            item.start = userInfor;
          } else {
            item.start.push(userInfor)
          }
          item.isStart = true;
          // 更新墙数据
          professions[index] = item
          //console.log(professions)
          that.setData({
            professionInfor: professions
          });
          // console.log(msgData,myStart);
          that.writeComment(msgData);//消息函数
          that.myCollect(myStart, isStart);//收藏函数
        },
        fail: err => {
          console.log(err)
        }
      });
    } else {
      console.log(e)
      const topicItem = that.data.topicProInfor;
      const topic = topicItem[e];
      //console.log(topic)
      myStart = {
        startItem: topic,
        startTime: app.getnowtime(),
        id: topic._id
      }
      msgData = {
        objId: topic._id,
        messageContents: '@' + userInfo.nickName + '收藏了你的话题！',
        bymsg: topic.topicAutor,
        msg: userInfor,
        openId: topic._openid,
        typeWall: topic.typeWall,
        time: app.getnowtime()
      }
      wx.cloud.callFunction({
        name: 'start',
        data: {
          id: topic._id,
          userInfo: userInfor,
          isCollect: true,
          startNum: topic.start.length + 1,
          type: topic.typeWall
        },
        success: res => {
          //console.log(res) 
          if (!topic.isStart) {
            topic.start = userInfor;
          } else {
            topic.start.push(userInfor)
          }
          topic.isStart = true;
          // 更新墙数据
          topicItem[e] = topic
          //console.log(professions)
          that.setData({
            topicProInfor: topicItem,
            actions: [{
              name: '已收藏',
              color: '#d4237a'
            },
            {
              name: '转发'
            }]
          });
          // console.log(msgData,myStart);
          that.writeComment(msgData);//消息函数
          that.myCollect(myStart, isStart);//收藏函数
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
    console.log(e)
    const that = this;
    const professions = that.data.professionInfor;
    const userInfo = app.globalData.userInfo;//收藏者
    const openId = app.globalData.userId;
    var myStart;//写入的收藏数据
    var msgData;//写入的消息
    var isStart = false;
    if (e.type) {
      const index = e.currentTarget.dataset.index;
      const item = professions[index]
      console.log(item);
      myStart = {
        id: item._id,
      }
      msgData = {
        objId: item._id,
        messageContents: '@' + userInfo.nickName + '取消了收藏！',
        bymsg: item.author,
        msg: userInfo,
        openId: item._openid,
        typeWall: item.typeWall,
        time: app.getnowtime()
      }
      wx.cloud.callFunction({
        name: 'start',
        data: {
          id: item._id,
          isCollect: false,
          type: item.typeWall
        }
      }).then(res => {
        //console.log(res)
        //把点赞设置为false
        item.isStart = false;
        professions[index] = item
        that.setData({
          professionInfor: professions
        });
        that.myCollect(myStart, isStart);
        that.writeComment(msgData)
      }).catch(err => { console.log(err) })
    } else {
      //console.log(e)
      const topicItem = that.data.topicProInfor;
      const topic = topicItem[e];
      //console.log(topic)
      myStart = {
        id: topic._id,
      }
      // msgData = {
      //   objId: topic._id,
      //   messageContents: '@' + userInfo.nickName + '取消了收藏！',
      //   bymsg: topic.topicAutor,
      //   msg: userInfo,
      //   openId: topic._openid,
      //   typeWall: topic.typeWall,
      //   time: app.getnowtime()
      // }
      wx.cloud.callFunction({
        name: 'start',
        data: {
          id: topic._id,
          isCollect: false,
          type: topic.typeWall
        }
      }).then(res => {
        //把点赞设置为false
        topic.isStart = false;
        topicItem[e] = topic
        that.setData({
          topicProInfor: topicItem,
          actions: [{
            name: '收藏'
          },
          {
            name: '转发'
          }]
        });
        that.myCollect(myStart, isStart);
        // that.writeComment(msgData)
      }).catch(err => { console.log(err) })
    }

  },
  /**
   * 存入收藏集合
   *  
   */
  myCollect: function (data, isStart) {
    //console.log(data)
    const id = data.id
    if (isStart) {
      db.collection('myCollect').add({
        data: data,
        success: function (res) {
          Toast.success({
            message: '已收藏',
            duration: 1000
          });
        },
        fail: function (err) {
          Toast.fail('收藏失败！')
        }
      })
    } else {
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
            //console.log(res)
            Toast.success({
              message: '已取消收藏',
              duration: 1000
            });
          }
        });
      });
    }

  },
  // 更多
  more(e) {
    const that = this;
    const index = e.currentTarget.dataset.index;//索引
    const topicItem = that.data.topicProInfor;//话题墙
    const topic = topicItem[index];//点击的话题
    //console.log(topic)
    const isStart = topic.isStart;
    //console.log(isStart)
    var action;
    if (isStart) {
      action = [{
        name: '已收藏',
        color: '#d4237a'
      }, {
        name: '转发'
      }]
    } else {
      action = [{
        name: '收藏'
      }, {
        name: '转发'
      }]
    }
    //console.log(action)
    this.setData({
      show: true,
      shartOrShareTopic: index,
      actions: action
    })
  },
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
  // 话题菜单
  selectSheet(e) {
    //console.log(e)
    const that = this;
    const name = e.detail.name;
    const topicItem = that.data.shartOrShareTopic;//索引
    if (name == '收藏') {
      that.shart(topicItem);
    } else if (name == '已收藏') {
      that.yesStart(topicItem);
    } else {//转发
      that.shareBtn(topicItem)
    }
  },
  /**
   * 点赞功能
   */
  onPraise: function (e) {
    console.log(e)
    const that = this;
    // const topName = that.data.topName;
    const professionIndex = e.currentTarget.dataset.professioninfor;
    const professions = that.data.professionInfor[professionIndex];//获取点击的墙
    const openId = app.globalData.userId//获取openid
    //console.log(openId)
    const openids = professions._openid
    //console.log(professions._openid)
    //获取墙数据
    const profession = that.data.professionInfor;

    const praiser = app.globalData.userInfo;//点赞人

    var praiseInfor = {//点赞信息
      openId: openId,
      avatarUrl: praiser.avatarUrl,
      nickName: praiser.nickName
    }
    // console.log(professions)
    // if (topName == 'b') {
    const topicProfession = that.data.topicProInfor;
    // that.onPraiseTopic(topicProfession, praiseInfor, professionIndex, openId, openids)
    // } else {
    const _id = professions._id
    var byPraise = professions.author;//被点赞人
    //如果以经点赞就不执行云函数
    if (!professions.isPraise) {//点赞
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
        if (!professions.praises) {//如果没有就等于praiseInfor,否则添加到praise里
          professions.praises = praiseInfor;
        } else {
          professions.praises.push(praiseInfor);
        }
        professions.isPraise = true;
        profession[professionIndex] = professions;//更新墙数据
        that.setData({
          professionInfor: profession
        });
        that.writeComment(msgData)//执行写入消息函数
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
          professionId: _id,
          praise: false,
        }
      }).then(res => {
        //把openID从praises中删掉
        const newPraises = [];
        professions.praises.forEach((praise, index) => {
          //console.log(praise)
          if (praise.openId != openId) {
            newPraises.push(praise);
          }
        });
        // console.log(newPraises);
        professions.praises = newPraises;
        //把点赞设置为false
        professions.isPraise = false;
        //把修改后的数据设置到原来的data中
        profession[professionIndex] = professions
        //把修改后的数据设置到data中
        this.setData({
          professionInfor: profession
        });
        // that.writeComment(msgData)//执行消息函数
      }).catch(err => {
        console.log(err)
      })
    }
    // }

  },
  // 点击评论图标，出现评论框
  comment(e) {
    //获取评论的墙索引
    const type = e.currentTarget.dataset.type;
    const professionIndex = e.currentTarget.dataset.professioninfor;
    var professionWall;
    var professionAuthor;
    if (type == 'topic') {//话题
      professionWall = this.data.topicProInfor[professionIndex];
      professionAuthor = professionWall.topicAutor
    } else {//表白墙
      //获取评论的墙
      professionWall = this.data.professionInfor[professionIndex];
      //获取被评论的用户
      professionAuthor = professionWall.author;
    }
    var number = professionWall.commentsNum;
    // 获取评论数
    // console.log(number)
    this.isBuilding = true; //楼主
    this.setData({
      reCommentInput: false,
      onCommentInputShow: true,
      professionAuthor: professionAuthor,
      commentId: professionWall._id,
      byCommenter: "",
      byCommenterId: professionWall._openid,
      comIndex: "",
      number: number
    })
  },
  /** 
   * 评论功能
  */
  formComment: function (e) {
    // console.log(e)
    const that = this;
    const openId = app.globalData.userId;
    const userInfor = app.globalData.userInfo;//获取评论用户信息
    console.log(openId, userInfor)
    const commentContent = e.detail.value.commentContent;//获取评论内容
    const professionAuthor = that.data.professionAuthor;
    const topName = that.data.topName;
    const byCommenter = that.data.byCommenter;
    const relComment = that.data.relComment;
    if (commentContent === "") {
      Toast('评论内容不能为空!')
      return
    }
    var type = 'wall';//当前所在类型
    // if (topName == 'b') {
    //   type = 'topic'
    // } else {
    //   type = 'wall'
    // }
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
        commenter: userInfor
      },
      time: time,
      commentContent: commentContent,
      byCommenters: {
        byCommenter: byCommenter
      },
      comIndex: that.data.comIndex
    }
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
        childComId: that.data.childComId, //评论回复的_id
        isBuilding: this.isBuilding //是否楼主
      }
    }).then(res => {
      if (topName == 'c') {
        that.loadExprees(0, true);
      } else if (topName == 'a') {
        that.loadExprees(0, false)
      } else {
        that.searchFriend(0)
      }
      Toast.success('评论成功');
      this.writeComment(msgData);
      this.setData({
        onCommentInputShow: false,
        professionAuthor: "",
        commentId: ""
      });

    }).catch(err => {
      console.log(err)
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
  /** 
   * 删除评论
  */
  delComment: function (e) {
    console.log(e)
    const that = this;
    const index = e.currentTarget.dataset.index;
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
    console.log(number)
    const openId = app.globalData.userId;
    const topName = that.data.topName;
    var type;
    if (topName == 'b') {
      type = 'topic'
    } else {
      type = 'wall'
    }
    var isDel = "delete";
    if (commenterId == openId) {
      comments.splice(index, 1);//删除这条评论
      if (!isChild) { //删除父评论时的评论数
        comments.forEach((value, index) => {
          number = number + value.childComment.length
        });
        number = number + comments.length
      }
      // console.log(comments,number)
      wx.showModal({
        title: '提示',
        content: '确定删除这条评论？',
        success: function (res) {
          if (res.confirm) {
            Toast.loading({
              message: '删除中...',
              forbidClick: true,
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
              if (topName == 'c') {
                that.loadExprees(0, true, isDel);
              } else if (topName == 'a') {
                that.loadExprees(0, false, isDel)
              } else {
                that.topicConfession(0)
              }
            }).catch(err => {
              console.log(err)
            })
          }
        }
      })
    }
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
      byCommenterId = commentItem[Index].comment.commentId
    }
    console.log(number)
    // 获取评论数
    this.isBuilding = false //不是楼主
    this.setData({
      onCommentInputShow: true,
      reCommentInput: true,
      relComment: true,
      byCommenter: byCommenter,
      commentId: commentId,
      comIndex: Index,
      number: number,
      byCommenterId: byCommenterId,
      childComId: comId
    })
  },
  // 话题墙
  // topicConfession: function (start = 0) {
  //   const that = this;
  //   // console.log(start)
  //   if (start > 0) {

  //   } else {
  //     Toast.loading({
  //       message: '加载中...',
  //       forbidClick: true
  //     })
  //   }

  //   wx.cloud.callFunction({
  //     name: 'topicProfessions',
  //     data: {
  //       start: start
  //     },
  //     success: function (res) {
  //       console.log(res)
  //       Toast.clear();
  //       const topicData = res.result.topicWall;//话题数据
  //       let newTopicInfor = [];
  //       if (start > 0) {//数据大于0，添加在数组后面
  //         newTopicInfor = that.data.topicProInfor.concat(topicData);

  //       } else {
  //         newTopicInfor = topicData
  //       }
  //       //console.log(newTopicInfor)
  //       that.setData({
  //         topicProInfor: newTopicInfor,
  //         hotTopic: res.result.topicHot,
  //         showGeMoreLoadin: false
  //       })
  //     }
  //   })
  // },
  //话题点赞
  // onPraiseTopic: function (topicAllInfor, praiser, topicIndex, openId, openids) {
  //   const that = this;
  //   const topicInfor = topicAllInfor[topicIndex]
  //   // console.log(topicInfor, praiser)
  //   const praises = topicInfor.praises;
  //   const praiseNum = praises.length;//点赞数
  //   const id = topicInfor._id;
  //   let content = '';
  //   // 处理异步问题
  //   new Promise((resovle, reject) => {
  //     if (!topicInfor.isPraise) {//没有点赞就点赞，否则取消点赞
  //       wx.cloud.callFunction({
  //         name: 'topicPraise',
  //         data: {
  //           topicWallId: id,
  //           praise: true,
  //           topicPraiser: praiser,
  //           praiseNum: praiseNum
  //         },
  //         success: function (res) {
  //           //console.log(res)
  //           content = '@' + praiser.nickName + '给你点赞了！';
  //           resovle(content);
  //           if (res.result.errMsg == 'document.update:ok') {
  //             if (!praises) {//判断是否有数据
  //               praises = praiser;
  //             } else {
  //               praises.push(praiser)
  //             }
  //             topicInfor.isPraise = true;
  //             topicInfor.praiseNum = topicInfor.praiseNum + 1;//点赞数加一
  //             topicAllInfor[topicIndex] = topicInfor;//更新墙数据
  //             that.setData({
  //               topicProInfor: topicAllInfor
  //             });
  //           }
  //         },
  //         fail: function (err) {
  //           console.log(err)
  //         }
  //       })
  //     } else {//取消点赞
  //       wx.cloud.callFunction({
  //         name: 'topicPraise',
  //         data: {
  //           praise: false,
  //           topicWallId: id,
  //           // praiseNum: praiseNum
  //         }
  //       }).then(res => {
  //         // console.log(res)
  //         // 把点赞数据从中删除
  //         content = '@' + praiser.nickName + '取消了赞！';
  //         resovle(content);//成功之后的数据
  //         const newPraises = [];
  //         //循环praises ，删掉我的openId
  //         praises.forEach((praise, index) => {
  //           if (praise.openId != openId) {
  //             newPraises.push(praise)
  //           }
  //         });
  //         topicInfor.praises = newPraises//更新点赞数据
  //         topicInfor.praiseNum = newPraises.length;//更新点赞数
  //         topicInfor.isPraise = false;//设置为false
  //         topicAllInfor[topicIndex] = topicInfor
  //         that.setData({//重新设置
  //           topicProInfor: topicAllInfor,
  //           // praiseNum:newPraises.length
  //         })
  //       }).catch(err => {
  //         console.log(err)
  //       })
  //     }
  //   }).then(res => {
  //     // console.log(res)
  //     var msgData = {//消息数据
  //       msg: praiser,
  //       objId: id,
  //       bymsg: topicInfor.topicAutor,
  //       messageContents: res,
  //       time: app.getnowtime(),
  //       openId: openids,
  //       typeWall: topicInfor.typeWall
  //     }
  //     that.writeComment(msgData);//执行消息方法
  //   }).catch(err => { console.log(err) })
  // },
})