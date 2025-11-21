const app = getApp()

Page({
  data: {
    userInfo: {
      nickName: '',
      avatar: ''
    },
    userProfile: null,
    growthDays: 0,
    babyInfo: {
      name: '',
      age: 0,
      gender: '未知'
    },
    currentBaby: null,
    babies: [],
    growthRecords: [],
    latestHeight: null,
    latestWeight: null,
    myItems: [],
    soldItems: 0,
    boughtItems: 0,
    favoriteTips: 0,
    favoritePlaces: 0,
    unreadMessages: 0,
    isLoading: false,
    showBabySelector: false
  },

  onLoad: function(options) {
    this.loadUserData()
    this.loadGrowthData()
    this.loadMarketData()
  },

  onShow: function() {
    this.refreshData()
  },

  loadUserData: async function() {
    try {
      const userInfo = app.getUserInfo()
      const userProfile = app.getUserProfile()
      const currentBaby = app.getCurrentBaby()
      const babies = app.getBabies()
      
      if (userInfo) {
        this.setData({
          userInfo: userInfo,
          userProfile: userProfile
        })
      }

      if (currentBaby) {
        this.setData({
          currentBaby: currentBaby,
          babyInfo: currentBaby
        })
        
        const today = new Date()
        const birthDate = new Date(currentBaby.birthDate || today)
        const growthDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24))
        
        this.setData({
          growthDays: growthDays > 0 ? growthDays : 0
        })
      }

      this.setData({
        babies: babies
      })

    } catch (error) {
      console.error('加载用户数据失败:', error)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
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

  showBabySelector: function() {
    if (this.data.babies.length <= 1) return
    
    this.setData({
      showBabySelector: true
    })
  },

  selectBaby: function(e) {
    const babyId = e.currentTarget.dataset.babyId
    const selectedBaby = this.data.babies.find(baby => baby.id === babyId)
    
    if (selectedBaby) {
      app.setCurrentBaby(selectedBaby)
      this.setData({
        currentBaby: selectedBaby,
        babyInfo: selectedBaby,
        showBabySelector: false
      })
      
      const today = new Date()
      const birthDate = new Date(selectedBaby.birthDate || today)
      const growthDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24))
      
      this.setData({
        growthDays: growthDays > 0 ? growthDays : 0
      })
      
      this.loadGrowthData()
    }
  },

  addBaby: function() {
    wx.navigateTo({
      url: '/pages/baby/add-baby'
    })
  },

  editCurrentBaby: function() {
    if (!this.data.currentBaby) {
      wx.showToast({
        title: '请先添加宝宝信息',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: `/pages/baby/edit-baby?id=${this.data.currentBaby.id}`
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

  logout: async function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？退出后需要重新登录。',
      confirmColor: '#FF6B95',
      success: async (res) => {
        if (res.confirm) {
          try {
            app.logout()
            
            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/login/login'
              })
            }, 1500)

          } catch (error) {
            console.error('退出登录失败:', error)
            wx.showToast({
              title: '退出失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  /*** 下拉刷新 ***/
  onPullDownRefresh: function() {
    this.refreshData()
    wx.stopPullDownRefresh()
  }
})
