var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],   // 蓝牙设备数据
    isLoading: false,   // 按钮加载图标
    services: [],   // 蓝牙支持的所有服务
    // 蓝牙特征值操作类型
    writeCharacter: false,
    readCharacter: false,
    notifyCharacter: false,
    serviceId: 0, // 蓝牙设备特征值对应服务的 uuid
  },

  /**
  * 1、初始化接口 success：获取蓝牙状态  fail：提示错误
  * 2、获取蓝牙状态
  * 3、判断蓝牙是否可用
  * 4、判断蓝牙是否为可搜索状态 if：是则停止搜索  else：开始搜索，打开蒙层，执行getBluetoothDevices函数
  * 
  */
  // 1、初始化接口
  startSearch() {
    var that = this
    dd.openBluetoothAdapter({
      success() {
        // 2、获取蓝牙状态
        dd.getBluetoothAdapterState({
          success(res) {
            // 3、蓝牙模块是否可用
            if (res.available) {
              // 4、蓝牙是否为搜索状态 if：是则停止搜索 else：不是则打开蒙层，开始搜索蓝牙设备
              if (res.discovering) {
                that.stopSearch()
              } else {
                dd.showLoading({
                  content: '加载中...',
                });
                that.getBluetoothDevices()
              }
            } else {
              dd.alert({
                title: '提示',
                content: '本机蓝牙不可用',
                buttonText: '确认',
              });
            }
          }
        })
      },
      fail() {
        dd.alert({
          title: '提示',
          content: '蓝牙初始化失败，请到设置打开蓝牙',
          buttonText: '确认',
        });
      }
    })
  },

  /**
   *  1、开启按钮上的加载图标 
   *  2、开始搜索蓝牙设备
   *  3、获取所有已发现的设备
   *  
   */
  // 搜索并获取蓝牙列表
  getBluetoothDevices() {
    var that = this
    that.setData({ isLoading: true })   // 1、开启按钮上的加载图标 
    dd.startBluetoothDevicesDiscovery({   // 2、开始搜索蓝牙设备  
      success() {
        // 3、获取所有已发现的设备
        setTimeout(function () {
          dd.getBluetoothDevices({
            // 4、获取设备列表存储在list中，并排除未知设备
            success(res) {
              var devices = []
              var num = 0
              for (var i = 0; i < res.devices.length; ++i) {
                if (res.devices[i].name != undefined) {
                  devices[num] = res.devices[i]
                  num++
                }
              }
              that.setData({
                list: devices,
                isLoading: false
              })
              that.stopSearch()
              dd.hideLoading()
            }
          })
        }, 5000)
      }
    })
  },

  // 停止搜索蓝牙
  stopSearch() {
    dd.stopBluetoothDevicesDiscovery({
      success() {
      }
    })
  },

  /**
   * 1、停止搜索蓝牙
   * 2、连接设备
   * 3、获取所有服务
   */
  getConnected(e) {
    var that = this
    this.stopSearch()  // 停止搜索
    that.setData({
      serviceId: 0,
      writeCharacter: false,
      readCharacter: false,
      notifyCharacter: false
    })
    dd.showLoading({
      content: '加载中...',
    });
    dd.connectBLEDevice({   // 连接蓝牙
      deviceId: e.currentTarget.dataset.title,    //    蓝牙ID
      success(res) {
        /**
         * 1、将连接的蓝牙ID赋值到全局变量
         * 2、后续会传给后端
         */
        app.BLEInformation.deviceId = e.currentTarget.dataset.title
        dd.getBLEDeviceServices({   //    获取蓝牙的所有服务
          deviceId: app.BLEInformation.deviceId,
          success(res) {
            //  将蓝牙的服务存进services
            app.BLEInformation.deviceId = e.currentTarget.dataset.title
            that.getSeviceId()  //获取蓝牙的所有服务
          },
          fail() {

          }
        })
      },
      fail(res) {
        console.log(res)
      }
    })
  },

  /**
   * 遍历获取蓝牙的特征值
   */
  getSeviceId: function () {
    var that = this
    var platform = app.BLEInformation.platform
    dd.getBLEDeviceServices({
      deviceId: app.BLEInformation.deviceId,
      success: function (res) {
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
  /**
   * 获取所有特征值
   */
  getCharacteristics: function () {
    var that = this
    var list = that.data.services
    var num = that.data.serviceId
    var write = that.data.writeCharacter
    var read = that.data.readCharacter
    var notify = that.data.notifyCharacter
    if (list.length == 0) {
      dd.alert({
        title: '提示',
        content: '找不到该读写的特征值',
      })
      dd.hideLoading()
      return
    }
    dd.getBLEDeviceCharacteristics({
      deviceId: app.BLEInformation.deviceId,
      serviceId: list[num].serviceId,
      success: function (res) {
        for (var i = 0; i < res.characteristics.length; ++i) {
          var properties = res.characteristics[i].properties
          var item = res.characteristics[i].characteristicId
          if (!notify) {
            if (properties.notify) {
              app.BLEInformation.notifyCharaterId = item
              app.BLEInformation.notifyServiceId = list[num].serviceId
              notify = true
            }
          }
          if (!write) {
            if (properties.write) {
              app.BLEInformation.writeCharaterId = item
              app.BLEInformation.writeServiceId = list[num].serviceId
              write = true
            }
          }
          if (!read) {
            if (properties.read) {
              app.BLEInformation.readCharaterId = item
              app.BLEInformation.readServiceId = list[num].serviceId
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
            dd.alert({
              title: '提示',
              content: '找不到该读写的特征值',
            })
          } else {
            that.getCharacteristics()
          }
        } else {
          dd.alert({
            title: '提示',
            content: '连接成功',
            buttonText: '确认',
            success: () => {
              app.BuleName = that.data.list[num].name
              dd.navigateBack({
                delta: 2
              })
            },
          });
          // that.openControl()
        }
      }, fail: function (e) {
        console.log(e)
      }, complete: function (e) {
        console.log("write:" + app.BLEInformation.writeCharaterId)
        console.log("read:" + app.BLEInformation.readCharaterId)
        console.log("notify:" + app.BLEInformation.notifyCharaterId)
      }
    })
    dd.hideLoading()
  },
  onLoad() { },
});
