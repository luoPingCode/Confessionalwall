//轻提示
import Toast from '../../../miniprogram_npm/@vant/weapp/toast/toast';

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 授权按钮
   */
  login:function(e){
    const userInfo = e.detail.rawData;
    if(userInfo){
      app.setUserInfo(userInfo);
      Toast.success('授权成功');
      setTimeout(() =>{
        wx.redirectTo({
          url: '../../send/send',
        },3000)
      });
       
    }else{

    }
  },
  /**
   * 取消按钮
   */
  cancle:function(e){
     wx.navigateBack()
  }
})