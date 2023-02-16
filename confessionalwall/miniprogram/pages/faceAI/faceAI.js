const config = require("./../../config.js");
const app = getApp()

Page({
    data: {
        baseImageUrl: app.globalData.imageUrl,
        showSelect: false,
        showBegin: true,
        showCancel: false,
        showReport: false,
        bindReport: false,
        showSubmit: false,
        tryAgant: false,
        imageLeft: '',
        imageRight: '',
        postImageLeft: '',
        postImageRight: '',
        rate: 0,
        face: '',
        conclusion: '',
        ageR: '', //右年龄
        ageL: '', //左年龄
        genderR: '', //右性别
        genderL: '' //左性别
    },
    onLoad: function (option) {
        this.hiddenSelect();
    },
    //  人脸比对
    compareface: function (image1, image2) {
        var that = this
        var genderL = that.data.genderL;
        var genderR = that.data.genderR;
        wx.cloud.callFunction({
            // 云函数名称
            name: 'faceApi',
            // 传给云函数的参数
            data: {
                "image1": image1,
                "image2": image2
            },
        }).then(res => {
            wx.hideLoading()
            console.log('face', res)
            try {
                const result = res.result.Score; //返回分数
                const score = result.toFixed(2); //精确两位小数点
                console.log(result.toFixed(2))
                const errmsg = res.errMsg
                // 云函数调用成功
                if (errmsg == 'cloud.callFunction:ok') {
                    if (genderR == genderL && score < 70) {
                        wx.showModal({
                            title: '提示',
                            content: '请上传不同性别的图片！',
                            showCancel: false,
                            success(res) {
                                if (res.confirm) {

                                }
                            }
                        });
                    } else {
                        // 生成报告
                        var data = that.aliDataAny(score)

                        wx.hideLoading();
                        that.setData({
                            rate: data.score,
                            face: data.key_world,
                            conclusion: data.message,
                            showReport: true,
                            bindReport: true,
                        });
                    }
                } else {
                    wx.showToast({
                        title: '网络错误，检测失败！',
                        icon: 'none'
                    })
                    setTimeout(function () {
                        wx.hideLoading();
                    }, 2000);
                    return false;
                }
            } catch (err) {
                wx.showToast({
                    title: '抱歉，无法检测，请更换照片重试',
                    icon: 'none'
                })
                setTimeout(function () {
                    wx.hideLoading();
                }, 2000);
                return false;
            }
        })
    },
    // 解析腾讯云接口返回的数据
    aliDataAny: function (score) {
        var score
        var keyWorld
        var message
        var level = 1;
        if (score >= 0 && score < 3) {
            keyWorld = '半毛钱脸';
            level = 0;
            message = '很严肃的告诉你，你们血缘上没有半毛钱关系！';
        } else if (score >= 3 && score < 10) {
            keyWorld = '路人脸';
            level = 1;
            message = '很愉快的告诉你，你们绝对不会是同父异母的兄弟姐妹！';
        } else if (score >= 10 && score < 20) {
            keyWorld = '情侣脸';
            level = 2;
            message = '你们的情侣脸指数跟（赵又廷、高圆圆）（黄晓明、杨颖）差不多，是标准的情侣脸。';
        } else if (score >= 20 && score < 30) {
            keyWorld = '七年情侣脸';
            level = 3;
            message = '你们在一起的时间越长，就会越像对方，就像邓超和孙俪那样。';
        } else if (score >= 30 && score < 46) {
            keyWorld = '夫妻脸';
            level = 4;
            message = '你们上辈子肯定是夫妻关系，国民夫妻相。';
        } else if (score >= 46 && score < 70) {
            keyWorld = '兄弟姐妹脸';
            level = 5;
            message = '你们不是兄弟姐妹吗？';
        } else if (score >= 70 && score < 80) {
            keyWorld = '镜子脸';
            level = 6;
            message = '自己的照片吧，简直一模一样。';
        } else if (score >= 80 && score <= 100) {
            keyWorld = '自己脸';
            level = 7;
            message = '别闹了，难道你喜欢你自己？';
        } else {
            keyWorld = '外星脸'; //系统检测，你不是地球人
            level = 8;
            message = '系统检测，你（系）们（统）不（出）是（bug）地(了)球人';
        }
        const data = {
            'key_world': keyWorld,
            'level': level,
            'message': message,
            'score': score
        }
        return data

    },
    // 上传图片
    showSelect: function () {
        this.setData({
            showSelect: true,
            showBegin: false,
            showCancel: true
        });
    },

    hiddenSelect: function () {
        this.setData({
            showSelect: false,
            showReport: false,
            bindReport: false
        });
    },

    cancelSelect: function () {
        this.setData({
            showSelect: false,
            showBegin: true,
            showCancel: false,
            bindReport: false,
            imageLeft: '',
            imageRight: ''
        });
    },

    selectLeft: function () {
        this.setData({
            showReport: false
        })
        this.ChooseImage('imageleft')
    },

    selectRight: function () {
        this.setData({
            showReport: false
        })
        this.ChooseImage('imageright')
    },
    // 图片
    ChooseImage(data) {
        var that = this
        wx.chooseImage({
            count: 4, //默认9
            sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album'], //从相册选择
            success: (res) => {
                console.log(res)
                //图片转为base64
                // 腾讯云接口---注意：如使用JS调用，请在生成图片的base64编码前缀中去掉data: image / jpeg; base64
                let base64 = wx.getFileSystemManager().readFileSync(res.tempFilePaths[0], 'base64')
                // console.log(base64.length)
                if (base64.length < 5120 * 1024) { //判断图片base64大小
                    that.DetectFace(base64, data)
                    if (data == 'imageleft') {
                        that.setData({
                            imageLeft: res.tempFilePaths[0],
                            postImageLeft: base64
                        })
                    } else if (data == 'imageright') {
                        that.setData({
                            imageRight: res.tempFilePaths[0],
                            postImageRight: base64
                        })
                    }
                    var showSubmit
                    if (that.data.imageLeft && that.data.imageRight) {
                        showSubmit = true
                    } else {
                        showSubmit = false
                    }
                    that.setData({
                        showSubmit: showSubmit
                    })
                } else {
                    wx.showToast({
                        title: "图片尺寸大于5M，请更换图片",
                        icon: 'none'
                    });
                }
            }
        });
    },
    // 人脸图片检测
    DetectFace(img, data) {
        wx.cloud.callFunction({
            name: 'DetectFaceAPI',
            data: {
                "img": img
            }
        }).then(res => {
            console.log(res)
            const age = res.result.FaceInfos[0].FaceAttributesInfo.Age; //年龄
            const genders = res.result.FaceInfos[0].FaceAttributesInfo.Gender; //性别
            var gender;
            if (genders < 50 && genders >= 0) {
                gender = '女'
            } else {
                gender = "男"
            }
            console.log(gender)
            if (data == 'imageleft') {
                this.setData({
                    ageL: age,
                    genderL: gender
                });
            } else {
                this.setData({
                    ageR: age,
                    genderR: gender
                });
            }
        }).catch(err => {
            wx.showModal({
                title: '提示',
                content: '请重新刷新之后，在上传图片',
                showCancel: false,
                success(res) {
                    if (res.confirm) {

                    }
                }
            });
        });
    },
    // 图片预览
    ViewImage(e) {
        wx.previewImage({
            urls: this.data.imgList,
            current: e.currentTarget.dataset.url
        });
    },
    // 图片删除
    DelImg(e) {
        wx.showModal({
            title: '提示',
            content: '确定要删除吗？',
            cancelText: '取消',
            confirmText: '确定',
            success: res => {
                if (res.confirm) {
                    this.data.imgList.splice(e.currentTarget.dataset.index, 1);
                    this.setData({
                        attachments: this.data.imgList
                    })
                }
            }
        })
    },
    // 提交检测
    submit: function () {
        var that = this
        var ageL = that.data.ageL;
        var ageR = that.data.ageR;
        if (this.data.postImageLeft == '') {
            wx.showToast({
                title: '左图上传失败，请重试',
                icon: 'none'
            })
            return false;
        }

        if (this.data.postImageRight == '') {
            wx.showToast({
                title: '右图上传失败，请重试',
                icon: 'none'
            })
            return false;
        }

        wx.showLoading({
            title: '检测中...',
        });
        // 返回结果
        // 进行解析
        // 图片1
        console.log(Math.abs(ageL - ageR))
        // if (genderL != genderR) {
        if (Math.abs(ageL - ageR) < 15) {
            var image1 = that.data.postImageLeft
            // 图片2
            var image2 = that.data.postImageRight
            // 调用比对函数
            that.compareface(image1, image2)
        } else {
            wx.hideLoading()
            wx.showModal({
                title: '提示',
                content: '图片年龄相差较大！请重新选择图片',
                showCancel: false,
                success(res) {
                    if (res.confirm) {

                    }
                }
            });
        }  
    },

    // 再试一次
    tryAgant: function () {
        this.setData({
            rate: 0,
            face: '',
            conclusion: '',
            showReport: false,
            bindReport: false,
            showCancel: true,
            tryAgant: false,
            showBegin: false,
            showSubmit: false,
            postImageLeft: '',
            PostImageRight: '',
            imageLeft: '',
            imageRight: '',
        });
    },

    onShareAppMessage: function (res) {
        return {
            title: '喜欢ta，那就说出来吧',
            path: '/pages/index/index',
            imageUrl: 'http://image.kucaroom.com/compare_face.jpg',
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})