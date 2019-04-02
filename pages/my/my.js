// pages/my/my.js
const app = getApp()
import Notify from '../../vant/notify/notify';
import Toast from '../../vant/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: wx.getStorageSync("type") || 0,
    hiddenmodalput: true,  //可以通过hidden是否掩藏弹出框的属性，来指定那个弹出框  
    hiddenmodalChange: true,  //更改姓名的弹窗
    password: "",
    name: "",
    show: false,
    windowHeight: null,
    windowWidth: null,
    date: '2019-03-01',
    time: '12:01',
    location: null,
    errmsg: null
  },
  /*点击开始一场面试,打卡弹出层*/ 
  startivright :function() {
    this.setData({
      show: true
    })
  },
  /*向后台传输数据并生成二维码,返回二维码路径*/ 
  startiv: function(){
    var that = this 
    if (this.data.errmsg == null || this.data.errmsg =="面试地点不能为空"){
      this.setData({
        errmsg: "面试地点不能为空"
      })
    }else{
    var startTime = this.data.date + " " + this.data.time;
    var duringTime = 20;
    var location = this.data.location
    wx.request({
      url: app.globalData.ip +'qrCode/create',
      data:{
        session: wx.getStorageSync("session_key"),
        startTime: startTime,
        duringTime: duringTime,
        location: location
      },
      success: res=>{
        console.log("创建二维码返回值:"+res.data)
        if (res.data =="exist"){
          Toast.fail('此次面试已存在!');
        } else if(res.data=="fail"){
          Toast.fail('发起失败!');
        }else{
          wx.setStorageSync("imageName", res.data + ".png")
          wx.setStorageSync("location", location)
          wx.setStorageSync("startTime", startTime)
          Toast.success('发起成功!');
        }
      },
      fail: err=>{
        console.log(err)
      } 

    })
    }
  },
  //关闭右侧弹出层
  onClose:function(){
    this.setData({
      show: false
    })
  },
 
  //日期,时间选择改变
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
  //地点修改
  location(e){
    console.log(e.detail);
    this.setData({
      location: e.detail,
      errmsg: ""
    })
  },
  //判断是否输入地点
  isEmpty(e) {
    if (e.detail.value == null || e.detail.value==""){
      this.setData({
        errmsg: "面试地点不能为空"
      })
    }

  },
  //点击按钮弹出指定的hiddenmodalput弹出框  
  login: function(){
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput,
    })
  },
  logout: function(){
    var type = app.globalData.type
    this.setData({
      type:0
    })
    wx.setStorageSync("type", 0)  //设置缓存,用以其他页面通过onshow重新获取数据
  },
  getPwd: function(e){  //获取输入的密码
    var pwd = e.detail.value.replace(/'/g,'');  //替换所有 '  符号为空
    this.setData({
      password: pwd
    })
    console.log(pwd)
  },
  getName: function(e){  //获取输入的姓名
    var name = e.detail.value
    this.setData({
      name: name
    })
    console.log(name)
  },
  //点击按钮弹出指定的hiddenmodalput弹出框  
  modalinput: function () {
    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },
  //取消按钮  
  cancel: function () {
    this.setData({
      hiddenmodalput: true,
      hiddenmodalChange: true
    });
  },
  //确认,在后端判断密码
  confirmLog: function (e) {
    var that = this
    console.log("password:" + that.data.password)
    this.setData({
      hiddenmodalput: true
    })
    wx.request({
      url: app.globalData.ip +'api/login',
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      data:{
        password: that.data.password,
        session: wx.getStorageSync("session_key")
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: res=>{
        console.log(res.data)
        if(res.data=="noPWD"){
          Notify({
            text: "尚未设置密码,请找管理员给予秘钥",
            duration: 3000,
            selector: '#custom-selector',
            backgroundColor: '#1989fa'
          });
        }
        if(res.data=="err"){
          Notify({
            text: "密码错误!",
            duration: 3000,
            selector: '#custom-selector',
            backgroundColor: '#8B008B'
          });
        }
        if(res.data=="ok"){
          that.setData({
            type : 1
          })
          wx.setStorageSync("type", 1)
          console.log(that.data.type)
        }
      },
      fail: err=>{
        console.log(err)
      }
    })
  },
  //确认修改姓名
  confirmName(){
    var that = this
    console.log("Name:" + that.data.name)
    this.setData({
      hiddenmodalChange: true
    })
    wx.request({
      url: app.globalData.ip + "changeName",
      data: {
        session_key: wx.getStorageSync("session_key"), //获取缓存中的session_key
        userName: that.data.name
      },
      method: "GET",
      success: res => {
        console.log("后端响应" + res.data)
        if (res.data == "ok") { //不在乎是否正确
          wx.setStorageSync("userName", that.data.name)
        } else if (res.data == "sessionERR") {
          Notify({
            text: "请在后台关闭小程序重新进入!",
            duration: 2000,
            selector: '#custom-selector',
            backgroundColor: '#DC143C'
          });
        }else if(res.data=="regex"){
          Notify({
            text: "只能输入中英文!",
            duration: 2000,
            selector: '#custom-selector',
            backgroundColor: '#DC143C'
          });
        }
      }, fail: res => {
        console.log(res);
      }

    })
  },
  onLoad: function(){  //加载时获取设备窗口大小
  
    this.setData({
      windowHeight: app.globalData.windowHeight,  //实际值略大于窗体 所以取它的9.7成
      windowWidth: app.globalData.windowWidth
    })
    console.log("高"+this.data.windowHeight)
    console.log("宽" + this.data.windowWidth)
  },
  changeName(){ //更改姓名弹窗
    this.setData({
      hiddenmodalChange: !this.data.hiddenmodalChange,
    })
  }

})