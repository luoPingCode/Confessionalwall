const app = getApp();
const db = wx.cloud.database();
import { getUUID, getExt } from "../../../utils/random";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempImages: [],
    private: false,
    type: '表白', //表白类型
    confessionType: 'confession',
    show: false,
    actions: [
      {
        name: '表白',
      },
      {
        name: '找读友',
      },
      {
        name: '找情侣',
      },
      {
        name: '其他'
      }
    ],
    selectPeople: '我喜欢',
    placeholder: '表白',
    placeholders: '表白的内容'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initImage();
  },
  /**
   * 打开上拉选择框
   */
  typeSel() {
    this.setData({
      show: true
    })
  },
  // 关闭上拉选择
  onClose() {
    this.setData({ show: false });
  },
  cancel() {
    this.onClose()
  },
  // 选择表白的类型
  onSelect(event) {
    console.log(event);
    const name = event.detail.name;
    if ('表白' == name) {
      this.setData({
        type: name,
        selectPeople: '我喜欢',
        placeholder: '表白',
        placeholders: '表白的内容',
        confessionType: 'confession'
      });
    } else {
      this.setData({
        type: name,
        selectPeople: '我想找',
        placeholder: '找',
        placeholders: '你想找的人'
      });
      if ('找读友' == name) {
        this.setData({
          confessionType: 'readFriend'
        });
      } else if ('找情侣' == name) {
        this.setData({
          confessionType: 'lovers'
        });
      } else {
        this.setData({
          confessionType: 'other'
        });
      }
    }

  },
  //图片排列
  initImage: function () {
    const windowWidth = wx.getSystemInfoSync().windowWidth;
    const containerWidth = windowWidth - 110;
    const btnWidth = windowWidth - 40;
    const imageSize = (containerWidth - 2.5 * 2) / 2
    this.setData({
      imageSize: imageSize,
      btnWidth: btnWidth
    })
  },
  /** 
   * 添加图片按钮
  */
  addImage: function (e) {
    const that = this;
    wx.chooseImage({
      count: 2,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (e) {
        // console.log(e)
        const tempImages = e.tempFilePaths;
        const oldImage = that.data.tempImages;
        const newImage = oldImage.concat(tempImages);
        that.setData({
          tempImages: newImage
        })
      }
    });
  },
  /** 
   * 删除图片按钮
  */
  closeBtn(e) {
    //获取图片索引
    const index = e.target.dataset.index;
    const tempImages = this.data.tempImages;
    tempImages.splice(index, 1);
    this.setData({
      tempImages: tempImages
    })
  },

  //表白函数
  publicContent: function (confessionContent) {
    db.collection('confessionContents').add({
      data: confessionContent,
      success(res) {
        wx.showToast({
          title: '表白成功！',
        });
        setTimeout(function () {
          wx.hideToast()
          wx.switchTab({
            url: '/pages/express/express',
          })
        }, 1000)

      },
      fail(err) {
        console.log(err);
      }
    })

  },
  /** 
   * 表白按钮
  */
  formSubmit: function (e) {
    // console.log(e)
    const that = this;
    const favoritePerson = e.detail.value.people;
    const content = e.detail.value.content;
    const author = app.globalData.userInfo;
    const type = that.data.confessionType; //获取页面表白类型数据
    console.log(type)
    if (content == "") {
      wx.showModal({
        content: "请输入表白内容"
      })
      return
    }
    const confessionContent = {
      favoritePerson: favoritePerson,
      content: content,
      author: author,
      fessionTime: new Date(),
      private: that.data.private,
      typeWall: 'wall',
      praises: [],
      commentsNum: 0,
      transmit: [],
      transmitNum: 0,
      start: [],
      startNum: 0,
      images: [],
      confessionType: type //表白类型
    }
    wx.showLoading({
      title: '表白中...',
    });
    //图片id list
    const fileIdList = [];
    if (this.data.tempImages.length > 0) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      that.data.tempImages.forEach((value, index) => {
        // console.log(value)
        const cloudPath = "vindicateImages/" + year + "/" + month + "/" + day + "/" + getUUID() + "." + getExt(value);
        let base64 = wx.getFileSystemManager().readFileSync(value, 'base64');//转换为base64格式
        if (base64.length < 5120 * 1024) {
          wx.cloud.callFunction({
            name: 'tenImgSecCheck',
            data: {
              img: base64
            }
          }).then(res => {
            // console.log(res)
            let label = res.result.Label;
            let suggestion = res.result.Suggestion;
            if ('Normal' == label && 'Pass' == suggestion) {
              wx.cloud.uploadFile({
                cloudPath: cloudPath,
                filePath: value,
              }).then(res => {
                // console.log(res);
                fileIdList.push(res.fileID);
                if (fileIdList.length === that.data.tempImages.length) {
                  confessionContent.images = fileIdList;
                  that.publicContent(confessionContent);
                }
              }).catch(err => {
                console.log(err);
              });
            } else {
              wx.hideLoading({
                success: (res) => {
                  wx.showModal({
                    title: '警告',
                    content: '你上传的图片具有违规内容，请重新选择!',
                    showCancel: false,
                    success(res) {
                      if (res.confirm) {

                      }
                    }
                  });
                },
              });
            }
          }).catch(err => {
            wx.showModal({
              title: '提示',
              content: '图片识别失败',
              showCancel: false
            });
          });
        } else {
          wx.showToast({
            title: "图片尺寸大于5M，请更换图片",
            icon: 'none'
          });
        }
      });
    } else {
      that.publicContent(confessionContent);
    }
  },
  /**
   * 是否匿名 
   */
  setPrivate: function (e) {
    let value = e.detail.value;
    this.setData({
      private: value
    });
  },

  /**
   * 图片预览 
   */
  preview: function (e) {
    const that = this;
    const index = e.target.dataset.index;
    const current = that.data.tempImages[index];
    wx.previewImage({
      urls: that.data.tempImages,
      current: current
    })
  }
})