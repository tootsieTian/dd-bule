Page({
  data: {
    list: [
      {
        name: "test",
        date: "2021-11-13"
      },
      {
        name: "test1",
        date: "2021-11-13"
      }, {
        name: "test",
        date: "2021-11-13"
      },
      {
        name: "test1",
        date: "2021-11-13"
      }, {
        name: "test",
        date: "2021-11-13"
      },
      {
        name: "test1",
        date: "2021-11-13"
      }, {
        name: "test",
        date: "2021-11-13"
      },
      {
        name: "test1",
        date: "2021-11-13"
      }, {
        name: "test",
        date: "2021-11-13"
      },
      {
        name: "test1",
        date: "2021-11-13"
      },
      {
        name: "test",
        date: "2021-11-13"
      },
      {
        name: "testtesttest",
        date: "2021-11-13"
      },
    ],
  },
  onLoad() { },
  menu() {
    dd.showActionSheet({
      items: ['查看', '编辑', '删除', '打印'],
      cancelButtonText: '取消',
      success: (res) => {
        let btn = res.index
        // console.log(btn)
        // if (btn == 0) {
        //   dd.navigateTo({
        //     url: '/pages/oneCar/detail/detail'
        //   })
        // }
        // if (btn == 1) {
        //   dd.navigateTo({
        //     url: '/pages/oneCar/edit/edit'
        //   })
        // }
        console.log(btn)
        switch (btn) {
          case 0:
            dd.navigateTo({
              url: '/pages/oneCar/detail/detail'
            })
            break
          case 1:
            dd.navigateTo({
              url: '/pages/oneCar/edit/edit'
            })
            break
          case 2:
            dd.confirm({
              title: '温馨提示',
              content: '确认删除？',
              confirmButtonText: '是',
              cancelButtonText: '否',
              success: (result) => {
                if (result.confirm) {
                  /**
                   * 删除该数据
                   */
                  dd.alert({
                    content: "删除了该数据"
                  })
                }
              },
            })
            break
          case 3:
            /**
             * 添加打印操作
             */
            break
        }

      },
    }); 
  },
  toAdd() {
    dd.navigateTo({
      url: '/pages/oneCar/add/add'
    })
  }
});
