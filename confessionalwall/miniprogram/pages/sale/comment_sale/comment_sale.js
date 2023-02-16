// pages/sale/comment_sale/comment_sale.js
const app = getApp();
let genderArray = ['男', '女', '人妖', '未知生物'];
const db = wx.cloud.database();
Page({
    data: {
        sale: [],
        comments: [],
        baseImageUrl: app.globalData.imageUrl,
        showCommentInput: false,
        content: '',
        objId: '',
        objType: '',
        refCommentId: '',
        attachments: '',
        canFollow: true,
        param: app.globalData.param,
        comIndex: '',
        byCommenter: '',
        id: ''
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
                // "from_user": {
                //     "avatar": avatar,
                //     "nickname": nickname
                // },
                // "created_at": updatetime,
                // "content": content,
                // "isread": false,
                // "messageuser": messageuser,
                // "objId": objId,
                // "obj_type": obj_type
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
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // console.log(options)
        wx.showLoading({
            title: '加载中...',
        })
        var that = this
        this.setData({
            param: app.globalData.param,
            sale: []
        })
        // 当前舍友详情的数据id
        var id = options.id
        that.getSale(id)
    },
    getSale(id) {
        const that = this;
        // 是否可以删除
        var can_delete = false;
        var comment_delete = false
        // 获取userInfo
        var userInfo = wx.getStorageSync('userInfo')
        // console.log('nickanme', userInfo)
        // 获取自己的openid或昵称
        var ownernickname = userInfo.nickName
        var owneropenid = app.globalData.userId
        wx.cloud.callFunction({
            name: 'saleDateil',
            data: {
                id: id,
            }
        }).then(res => {
            // console.log(res)
            const data = res.result.list[0]
            if (res.errMsg == "cloud.callFunction:ok") {
                console.log(data)
                let comment = data.comments;
                let comment_number = comment.length; //获取评论长度
                let _openid = data._openid;
                let praises = data.praises; //获取点赞数据
                var isfollow = false
                for (var i = 0; i < comment_number; i++) {
                    var commentOpenid = comment[i].comment.commentId;
                    // console.log(commentOpenid)
                    if (commentOpenid === owneropenid) {
                        comment_delete = true;
                    }
                }
                // console.log(comment_delete)
                // 判断是否可删除
                if (owneropenid === _openid) {
                    can_delete = true
                }
                if (praises.length > 0) {
                    // 判断是否已经follow
                    praises.forEach((value, index) => {
                        // console.log(value)
                        if (value.praiseOpenid === owneropenid) {
                            // 没有follow
                            isfollow = true
                        }
                    });
                }
                var saledata = {
                    "name": data.name,
                    "gender": data.gender,
                    "major": data.major,
                    "expectation": data.expectation,
                    "introduce": data.introduce,
                    "id": data._id,
                    "follow": isfollow, //是否以喜欢
                    "follower": data.praises,
                    "follow_number": data.praises.length,
                    "can_delete": can_delete,
                    "comment_number": comment_number,
                    "attachments": data.attachments,
                    "comments": data.comments,
                    "posteropenid": data._openid,
                    "poster": data.poster,
                    "comment_delete": comment_delete
                }
                that.setData({
                    sale: saledata,
                    objId: data._id,
                    comments: data.comments,
                    id: id
                });
                wx.hideLoading()
            }
        }).catch(err => { });
    },
    // 删除帖子
    deleteSale: function (e) {
        var that = this
        var id = e.currentTarget.dataset.id
        var fileid = e.currentTarget.dataset.fileid
        console.log(fileid)
        wx.showModal({
            title: '提示',
            content: '确定删除这个卖舍友吗？',
            success(res) {
                if (res.confirm) {
                    // 获取自己的帖子
                    // 删除帖子
                    db.collection('saleFriend')
                        .doc(id)
                        .remove({
                            success: res => {
                                console.log(res)
                                // 删除帖子的图片
                                wx.cloud.deleteFile({
                                    fileList: [fileid],
                                    success: res => {
                                        // handle success
                                        console.log(res)
                                        console.log(res.fileList)
                                        // 获取删除后的帖子列表
                                        // that.getPost()
                                        wx.showToast({
                                            title: '已删除',
                                        })
                                        wx.navigateBack({

                                        })
                                    },
                                    fail: err => {
                                        wx.showToast({
                                            title: '删除失败',
                                        })
                                    }
                                })
                            },
                            fail: err => {
                                // console.log(err)
                                wx.showToast({
                                    title: '删除失败',
                                })
                            },
                        })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
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
    // follow,喜欢
    follow: function (e) {
        var that = this
        var sale = that.data.sale
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
                that.message(mesdata)
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
     * 评论
     */
    postComment: function (e) {
        var that = this
        wx.showLoading({
            title: '发送中...',
        });
        // 帖子类型ID
        this.isBuilding = true
        let objType = this.data.objType;
        // 帖子ID
        let objId = this.data.objId;
        let byCommenter = that.data.byCommenter;
        // 评论内容
        let content = this.data.content;
        let refCommentId = this.data.refCommentId;
        // 已有评论
        let comments = this.data.sale.comments
        let sale = this.data.sale
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
            id: sale.id,
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
    /** 
     * 预览图片
     */
    previewImage: function (event) {
        let url = event.target.id;
        wx.previewImage({
            current: '',
            urls: [url]
        })
    },

    /**
     * 触摸屏幕后移动触发一些隐藏操作
     */
    hiddenComment: function () {
        this.setData({
            showCommentInput: false
        });
    },

    /**
     * 显示评论输入框
     */
    showCommentInput: function (e) {
        let objid = e.currentTarget.dataset.objid;
        let type = e.currentTarget.dataset.type;
        let refId = e.currentTarget.dataset.refid;
        // 显示输入评论
        // this.showModal()
        this.setData({
            modalName: e.currentTarget.dataset.target,
            showCommentInput: true,
            objId: objid,
            objType: type,
            refCommentId: refId,
            childComId: '',
            byCommenter: ''
        });
    },
    /**
     * 删除评论
     */
    deleteComment(e) {
        const id = e.currentTarget.dataset.id;
        const saleData = this.data.sale;
        wx.showLoading({
            title: '删除中...',
        });
        wx.cloud.callFunction({
            name: 'comments',
            data: {
                type: 'sale',
                number: saleData.comment_number - 1,
                _id: saleData.id,
                commentId: id,
                deleteComment: false,
                isBuilding: true //是否楼主
            }
        }).then(res => {
            wx.hideLoading();
            let id = this.data.id
            this.getSale(id)
            // console.log(res)
        }).catch(err => { })
    },
    /**
     * 分享
     */
    onShareAppMessage: function (res) {
        return {
            title: "卖舍友啦，便宜又好看，五毛钱一个清仓大甩卖...",
            path: '/pages/home/index/index?type=sale_friend&id=' + this.data.sale.id,
            imageUrl: this.data.baseImageUrl + this.data.sale.attachments[0],
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
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
     * 分享
     */
    onShareAppMessage: function (res) {
        return {
            title: "卖舍友啦，便宜又好看，五毛钱一个清仓大甩卖...",
            path: '/pages/home/index/index?type=sale_friend&id=' + this.data.sale.id,
            imageUrl: this.data.baseImageUrl + this.data.sale.attachments[0],
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
})