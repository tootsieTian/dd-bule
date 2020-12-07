var app = getApp()
Page({
  data: {
    buleName: ""
  },
  onLoad() {

  },
  onShow() {
    this.setData({
      buleName: app.BuleName
    })
    console.log(this.data.buleName)
  },
  buletoothList() {
    dd.navigateTo({
      url: '/pages/bule/bule'
    })
  }
});
