//index.js
//获取应用实例
const app = getApp()
import Notify from '../../vant/notify/notify';
Page({
  data: {
    windowHeight: null,
    windowWidth: null,
    type: wx.getStorageSync("type")|| 0, //登录人员类型
    show: false,   //弹出层状态
    qrFlag: true,  //扫码成功后设置为false可隐藏
    waitFlag: false, //等待按钮
    frontNum: "...",  //前方人数
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    qrSrc: null,
    name: wx.getStorageSync("userName")||{},
    location: null,
    startTime: null,
    interview: null  //面试场次信息数组
  },
  //定时器
  startReportHeart() {
    var that = this
    console.log("定时器开始")
    var timerNum = setTimeout(function () {
      console.log("循环方法一"+new Date())
      that.getfrontNum();
      that.startReportHeart();
    }, app.globalData.num_delay)
    // 保存定时器name
    that.setData({
      timer: timerNum //定时器号,用于停止定时器 clearTimeout(number timeoutID)
    })
  },
  //获取前面的人数
  getfrontNum(){
    var that = this
    console.log("开始获取前面的人数")
    wx.request({
      url: app.globalData.ip +'api/HowManyFront',
      data:{
        ivid: wx.getStorageSync("ivid"),
        session: wx.getStorageSync("session_key")
      },
      success: res=>{
        console.log("前方人数:"+res.data);
        that.setData({
          frontNum: res.data
        })
      },
      fail: err=>{
        console.log(err);
      }
    })
  },
  downloadQr(){  //下载二维码
    var imageName = wx.getStorageSync("imageName")
    if(imageName==null||imageName==""){
        //do nothing
    }else{
      wx.downloadFile({
        url: this.data.qrSrc,
        success: res=>{
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200){
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                wx.showToast({
                  title: '保存图片成功！',
                })
              },
              fail(res) {
                wx.showToast({
                  title: '保存图片失败！',
                })
              }
            })
          }
        }
      })
    }
    
  },
  //打开右侧弹出层
  onOpen(){
    this.setData({ show: true });
  },
  //关闭右侧弹出层
  onClose() {
    this.setData({ show: false });
  },
  // 判断是否参加面试 
  didIJion(){
    var that  = this
    //在页面加载时判断用户有没有参加面试
    wx.request({
      url: app.globalData.ip + 'api/DidJion',
      data: {
        session: wx.getStorageSync("session_key")
      },
      method: 'GET',
      success: function (res) {
        console.log("api/DidJion 返回的数组的id号:" + res.data[0])
        //[{"ivId":97,"openid":"oHHp45HxcRuznJYKXyyJM3DJxV5w","location":"第五次","publishTime":"2019-04-01 11:16:38","startTime":"2019-03-01 12:01:00","duringTime":20,"codeInfo":"https://localhost/interview/qrCode/addInterview?ivid=97","codeImg":"D:\\qrcode\\oHHp45HxcRuznJYKXyyJM3DJxV5w1551412860000第五次.png","ivType":0}]
        var interview = res.data
        that.setData({
          interview: interview
        })

      },
      fail: err => {
        console.log("something wrong with backend,i guess")
      }
    })
  },
  //监听页面显示时,重新获取data值
  onShow: function () {
    var that = this
    this.setData({
      type: wx.getStorageSync("type"),
      //获取图片路径
      qrSrc: app.globalData.imageIp + wx.getStorageSync("imageName"),
      name: wx.getStorageSync("userName"),
      location: wx.getStorageSync("location") || null,
      startTime: wx.getStorageSync("startTime")|| null
    })
    console.log("qrsrc:"+this.data.qrSrc)
    //调用方法 
    this.didIJion();
    //开始执行定时器
    this.startReportHeart();
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //refuse取消预约
  refuse(){
    this.setData({
      qrFlag: true,
      waitFlag: false
    })
  },
  qr: function(){ //扫描二维码,并参加面试
    var that = this
    this.setData({
      qrFlag: false,
      waitFlag: true
    })
    wx.scanCode({
      scanType: ['qrCode'],
      success: res => {
        var url = res.result
        var ivid = url.split("=")[1]   // 保存ivid号到缓存用于查询当前扫描的面试前面人数!
        wx.setStorageSync("ivid", ivid)
        //传递给后端对字符串uri编码
        var sessionkey = encodeURIComponent(wx.getStorageSync("session_key"))
        wx.request({   //扫描二维成功,发送请求
          url: res.result + "&session=" + sessionkey,
          success: ok=>{   
            that.setData({
              waitFlag: false
            })
            //刷新数据面试
            that.didIJion();
            //获取前方人数
            that.getfrontNum();
            console.log(ok.data)
            if(ok.data=="exist"){
              Notify({
                text: "您已参加过此次面试!",
                duration: 4000,
                selector: '#custom-selector',
                backgroundColor: '#8B008B'
              })
              that.setData({
                frontNum: wx.getStorageSync("frontNum")
              })
            }else if(ok.data=="over"){
              that.setData({
                qrFlag: true,
              })
              Notify({
                text: "面试已结束!",
                duration: 4000,
                selector: '#custom-selector',
                backgroundColor: '#8B008B'
              })
            }else{
              wx.setStorageSync("frontNum", ok.data - 1)
              that.setData({
                frontNum: ok.data-1
              })
            }
          }
        })
        console.log(sessionkey)
        console.log("扫描内容:"+res.result);
      },
      fail: err => {
        that.setData({
          qrFlag: true,
          waitFlag: false
        })
        Notify({
          text: "解析二维码失败!",
          duration: 4000,
          selector: '#custom-selector',
          backgroundColor: '#8B008B'
        })
      }
    })
  },
  cancelQr: function(){
    this.setData({
      qrFlag: true,
      waitFlag: false

    })
  },
  onLoad: function () {
    this.setData({  //设置设备宽高
      windowHeight: app.globalData.windowHeight,  //实际值略大于窗体 所以取它的9.7成
      windowWidth: app.globalData.windowWidth
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
