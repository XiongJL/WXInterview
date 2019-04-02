// pages/welcome/welcome.js
import Notify from '../../vant/notify/notify';
const app = getApp()
Page({
  data: {
    userName: ""
  },
  nameInput: function(e) {
    this.setData({
      userName: e.detail.value
    })
    //console.log(this.data.userName)
  },
  saveName: function(e) {
    //保存userName 到 Storage  本地缓存中
    if (this.data.userName) {
      var userName = this.data.userName
      wx.setStorageSync("userName", userName)
      wx.showModal({
        title: '提示',
        content: '姓名：' + this.data.userName + " ?",
        success(res) {
          if (res.confirm) {
            //用户确认后，通过session_key访问到后台，查询有没有姓名
            console.log(wx.getStorageSync("session_key"))
            console.log("输出缓存的名字：" + wx.getStorageSync("userName"))
            wx.request({
              url: app.globalData.ip + "saveName",
              data: {
                session_key: wx.getStorageSync("session_key"), //获取缓存中的session_key
                userName: userName
              },
              method: "GET",
              success: res => {
                console.log("后端响应"+res.data)
                if(res.data=="ok") { //不在乎是否正确
                  wx.setStorageSync("userName", userName)                  
                  wx.reLaunch({ //跳转
                    url: '/pages/index/index',
                  })
                } else if (res.data =="sessionERR"){
                  Notify({
                    text: "请在后台关闭小程序重新进入!",
                    duration: 2000,
                    selector: '#custom-selector',
                    backgroundColor: '#DC143C'
                  });
                }
              },fail: res=>{
                console.log(res);
              }
              
            })



            // wx.reLaunch({   //直接跳转
            //   url: '/pages/index/index',
            // })
          }
        }
      })
    } else {
      wx.showModal({ //提示
        content: '请输入姓名！',
      })
    }

  },

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(wx.getStorageInfoSync('logs'))
    //判断是否有缓存授权信息信息，若有直接跳转
    if (wx.getStorageSync("userName") != null && wx.getStorageSync("userName") != "") {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})