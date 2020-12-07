// pages/blueconn/blueconn.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],   //蓝牙设备数据
    services: [],   //蓝牙的所有服务
    serviceId: 0,
    writeCharacter: false,
    readCharacter: false,
    notifyCharacter: false,
    isScanning: false
  },
  /**
   * 1、初始化接口 if：正在搜索则停止搜索 else if：获取所有已发现的蓝牙设备信息
   * 2、
   */
  startSearch: function () {
    var that = this
    //初始化接口
    dd.openBluetoothAdapter({
      success: function (res) {
        dd.getBluetoothAdapterState({
          success: function (res) {
            console.log('openBluetoothAdapter success', res)
            if (res.available) {
              if (res.discovering) {
                dd.stopBluetoothDevicesDiscovery({
                  success: function (res) {
                    console.log(res)
                  }
                })
              } else {
                // that.startBluetoothDevicesDiscovery()
                that.getBluetoothDevices()
              }
            } else {
              console.log("本机蓝牙不可用")
            }
          },
        })
      }, fail: function () {
        console.log("蓝牙初始化失败，请到设置打开蓝牙")
      }
    })
  },
  // checkPemission: function () {  //android 6.0以上需授权地理位置权限
  //   var that = this
  //   var platform = app.BLEInformation.platform
  //   if (platform == "ios") {
  //     app.globalData.platform = "ios"
  //     that.getBluetoothDevices()
  //   } else if (platform == "android") {
  //     app.globalData.platform = "android"
  //     console.log(app.getSystem().substring(app.getSystem().length - (app.getSystem().length - 8), app.getSystem().length - (app.getSystem().length - 8) + 1))
  //     if (app.getSystem().substring(app.getSystem().length - (app.getSystem().length - 8), app.getSystem().length - (app.getSystem().length - 8) + 1) > 5) {
  //       dd.getSetting({
  //         success: function (res) {
  //           console.log(res)
  //           if (!res.authSetting['scope.userLocation']) {
  //             dd.authorize({
  //               scope: 'scope.userLocation',
  //               complete: function (res) {
  //                 that.getBluetoothDevices()
  //               }
  //             })
  //           } else {
  //             that.getBluetoothDevices()
  //           }
  //         }
  //       })
  //     }
  //   }
  // },

  /**
   * 1.开始搜索蓝牙设备
   * 2.获取所有已发现的蓝牙设备
   */
  getBluetoothDevices: function () {  //获取蓝牙设备信息
    var that = this
    console.log("start search")
    //开启加载图标
    that.setData({
      isScanning: true
    })
    dd.startBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res)
        setTimeout(function () {
          dd.getBluetoothDevices({
            success: function (res) {
              log(res)
              var devices = []
              var num = 0
              for (var i = 0; i < res.devices.length; ++i) {
                if (res.devices[i].name != "未知设备") {
                  devices[num] = res.devices[i]
                  num++
                }
              }
              console.log(devices)
              that.setData({
                list: devices,
                isScanning: false
              })
              dd.hideLoading()
              dd.stopPullDownRefresh()
              dd.stopBluetoothDevicesDiscovery({
                success: function (res) {
                  console.log("停止搜索蓝牙")
                }
              })
            },
          })
        }, 5000)
      },
    })
  },
  bindViewTap: function (e) {
    var that = this
    dd.stopBluetoothDevicesDiscovery({
      success: function (res) { console.log(res) },
    })
    that.setData({
      serviceId: 0,
      writeCharacter: false,
      readCharacter: false,
      notifyCharacter: false
    })
    console.log(e.currentTarget.dataset.title)
    dd.showLoading({
      title: '正在连接',

    })
    dd.createBLEConnection({
      deviceId: e.currentTarget.dataset.title,
      success: function (res) {
        console.log(res)
        app.BLEInformation.deviceId = e.currentTarget.dataset.title
        that.getSeviceId()
      }, fail: function (e) {
        // dd.showModal({
        //   title: '提示',
        //   content: '连接失败',
        //   showCancel: false
        // })
        console.log("连接失败")
        console.log(e)
        dd.hideLoading()
      }, complete: function (e) {
        console.log(e)
      }
    })
  },
  getSeviceId: function () {
    var that = this
    var platform = app.BLEInformation.platform
    console.log(app.BLEInformation.deviceId)
    dd.getBLEDeviceServices({
      deviceId: app.BLEInformation.deviceId,
      success: function (res) {
        console.log(res)
        // var realId = ''
        // if (platform == 'android') {
        //   // for(var i=0;i<res.services.length;++i){
        //   // var item = res.services[i].uuid
        //   // if (item == "0000FEE7-0000-1000-8000-00805F9B34FB"){
        //   realId = "0000FEE7-0000-1000-8000-00805F9B34FB"
        //   //       break;
        //   //     }
        //   // }
        // } else if (platform == 'ios') {
        //   // for(var i=0;i<res.services.length;++i){
        //   // var item = res.services[i].uuid
        //   // if (item == "49535343-FE7D-4AE5-8FA9-9FAFD205E455"){
        //   realId = "49535343-FE7D-4AE5-8FA9-9FAFD205E455"
        //   // break
        //   // }
        //   // }
        // }
        // app.BLEInformation.serviceId = realId
        that.setData({
          services: res.services
        })
        that.getCharacteristics()
      }, fail: function (e) {
        console.log(e)
      }, complete: function (e) {
        console.log(e)
      }
    })
  },
  getCharacteristics: function () {
    var that = this
    var list = that.data.services
    var num = that.data.serviceId
    var write = that.data.writeCharacter
    var read = that.data.readCharacter
    var notify = that.data.notifyCharacter
    dd.getBLEDeviceCharacteristics({
      deviceId: app.BLEInformation.deviceId,
      serviceId: list[num].uuid,
      success: function (res) {
        console.log(res)
        for (var i = 0; i < res.characteristics.length; ++i) {
          var properties = res.characteristics[i].properties
          var item = res.characteristics[i].uuid
          if (!notify) {
            if (properties.notify) {
              app.BLEInformation.notifyCharaterId = item
              app.BLEInformation.notifyServiceId = list[num].uuid
              notify = true
            }
          }
          if (!write) {
            if (properties.write) {
              app.BLEInformation.writeCharaterId = item
              app.BLEInformation.writeServiceId = list[num].uuid
              write = true
            }
          }
          if (!read) {
            if (properties.read) {
              app.BLEInformation.readCharaterId = item
              app.BLEInformation.readServiceId = list[num].uuid
              read = true
            }
          }
        }
        if (!write || !notify || !read) {
          num++
          that.setData({
            writeCharacter: write,
            readCharacter: read,
            notifyCharacter: notify,
            serviceId: num
          })
          if (num == list.length) {
            // dd.showModal({
            //   title: '提示',
            //   content: '找不到该读写的特征值',
            //   showCancel: false
            // })
            console.log("找不到该读写的特征值")
          } else {
            that.getCharacteristics()
          }
        } else {
          dd.showToast({
            title: '连接成功',
          })
          that.openControl()
        }
      }, fail: function (e) {
        console.log(e)
      }, complete: function (e) {
        console.log("write:" + app.BLEInformation.writeCharaterId)
        console.log("read:" + app.BLEInformation.readCharaterId)
        console.log("notify:" + app.BLEInformation.notifyCharaterId)
      }
    })
  },
  openControl: function () {//连接成功返回主页
    dd.navigateTo({
      url: '../home/home',
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    dd.getSystemInfo({
      success: (res) => {
        app.BLEInformation.platform = res.platform
      }
    })
    // app.BLEInformation.platform = dd.getPlatform()
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

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {
  //     // var that = this
  //     // dd.startPullDownRefresh({})
  //     // that.startSearch()
  // },

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