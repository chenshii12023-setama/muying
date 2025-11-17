const app = getApp()

Page({
  data: {
    userInfo: {
      nickName: '',
      avatar: ''
    },
    growthDays: 0,
    babyInfo: {
      name: '',
      age: 0,
      gender: '未知'
    },
    growthRecords: [],
    latestHeight: null,
    latestWeight: null,
    myItems: [],
    soldItems: 0,
    boughtItems: 0,
    favoriteTips: 0,
    favoritePlaces: 0,
    unreadMessages: 0
  },

  onLoad: function(options) {
    this.loadUserData()
    this.loadGrowthData()
    this.loadMarketData()
  },

  onShow: function() {
    this.refreshData()
  },

  loadUserData: function() {
    const userInfo = app.getUserInfo()
    const babyInfo = app.getBabyInfo()
    
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    }

    if (babyInfo) {
      const today = new Date()
      const birthDate = new Date(babyInfo.birthDate || today)
      const growthDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24))
      
      this.setData({
        babyInfo: babyInfo,
        growthDays: growthDays > 0 ? growthDays : 0
      })
    }
  },

  loadGrowthData: function() {
    const growthRecords = wx.getStorageSync('growthRecords') || []
    const latestRecord = growthRecords[growthRecords.length - 1]
    
    this.setData({
      growthRecords: growthRecords,
      latestHeight: latestRecord ? latestRecord.height : null,
      latestWeight: latestRecord ? latestRecord.weight : null
    })
  },

  loadMarketData: function() {
    const myItems = wx.getStorageSync('myMarketItems') || []
    const soldItems = wx.getStorageSync('soldItems') || 0
    const boughtItems = wx.getStorageSync('boughtItems') || 0
    const favoriteTips = wx.getStorageSync('favoriteTips') || []
    const favoritePlaces = wx.getStorageSync('favoritePlaces') || []
    
    this.setData({
      myItems: myItems,
      soldItems: soldItems,
      boughtItems: boughtItems,
      favoriteTips: favoriteTips.length,
      favoritePlaces: favoritePlaces.length
    })
  },

  refreshData: function() {
    this.loadUserData()
    this.loadGrowthData()
    this.loadMarketData()
  },

  goToBabyManage: function() {
    wx.navigateTo({
      url: '/pages/baby/baby?action=manage'
    })
  },

  goToGrowthManage: function() {
    wx.navigateTo({
      url: '/pages/baby/baby?action=growth'
    })
  },

  goToPrivacy: function() {
    wx.navigateTo({
      url: '/pages/settings/privacy'
    })
  },

  goToHelp: function() {
    wx.navigateTo({
      url: '/pages/settings/help'
    })
  },

  goToAbout: function() {
    wx.navigateTo({
      url: '/pages/settings/about'
    })
  },

  showLogoutConfirm: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmColor: '#FF6B95',
      success: (res) => {
        if (res.confirm) {
          this.logout()
        }
      }
    })
  },

  logout: function() {
    // 清除用户数据
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('babyInfo')
    wx.removeStorageSync('token')
    
    // 返回登录页
    wx.reLaunch({
      url: '/pages/login/login'
    })
  },

  onPullDownRefresh: function() {
    this.refreshData()
    wx.stopPullDownRefresh()
  }
})