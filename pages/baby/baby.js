const app = getApp()

Page({
  data: {
    activeTab: 'info',
    babyInfo: {},
    growthRecords: 0,
    milestones: 0,
    growthRecordsList: [],
    milestonesList: [],
    healthRecords: []
  },

  onLoad: function(options) {
    if (options.tab) {
      this.setData({
        activeTab: options.tab
      })
    }
    
    this.loadBabyInfo()
    this.loadGrowthRecords()
    this.loadMilestones()
    this.loadHealthRecords()
  },

  onShow: function() {
    this.loadBabyInfo()
    this.loadGrowthRecords()
    this.loadMilestones()
    this.loadHealthRecords()
  },

  loadBabyInfo: function() {
    const babyInfo = app.getBabyInfo()
    if (babyInfo) {
      this.setData({
        babyInfo: babyInfo
      })
    } else {
      // 模拟宝宝信息
      const currentBaby = wx.getStorageSync('currentBaby')
      if (currentBaby) {
        this.setData({
          babyInfo: currentBaby
        })
      } else {
        this.setData({
          babyInfo: {
            name: '宝宝',
            gender: '未知',
            birthDate: '2024-01-01',
            age: 6,
            weight: 7.5,
            height: 65,
            headSize: 42,
            avatarText: '👶'
          }
        })
      }
    }
  },

  loadGrowthRecords: function() {
    // 模拟成长记录数据
    const records = [
      {
        id: 1,
        date: '2024-01-15',
        weight: 3.8,
        height: 52,
        headSize: 36
      },
      {
        id: 2,
        date: '2024-02-15',
        weight: 5.2,
        height: 58,
        headSize: 38
      },
      {
        id: 3,
        date: '2024-03-15',
        weight: 6.3,
        height: 62,
        headSize: 40
      }
    ]
    
    this.setData({
      growthRecordsList: records,
      growthRecords: records.length
    })
  },

  loadMilestones: function() {
    // 模拟里程碑数据
    const milestones = [
      {
        id: 1,
        title: '第一次翻身',
        icon: '🔄',
        date: '2024-02-10',
        status: 'achieved',
        statusText: '已达成'
      },
      {
        id: 2,
        title: '第一次笑出声',
        icon: '😄',
        date: '2024-02-20',
        status: 'achieved',
        statusText: '已达成'
      },
      {
        id: 3,
        title: '第一次坐立',
        icon: '🧘',
        date: '待完成',
        status: 'pending',
        statusText: '进行中'
      },
      {
        id: 4,
        title: '第一次爬行',
        icon: '🐢',
        date: '待完成',
        status: 'pending',
        statusText: '未开始'
      }
    ]
    
    this.setData({
      milestonesList: milestones,
      milestones: milestones.filter(item => item.status === 'achieved').length
    })
  },

  loadHealthRecords: function() {
    // 模拟健康记录数据
    const healthRecords = [
      {
        id: 1,
        type: '疫苗接种',
        date: '2024-01-20',
        details: '乙肝疫苗第一针'
      },
      {
        id: 2,
        type: '体检',
        date: '2024-02-15',
        details: '3个月常规体检，生长发育正常'
      }
    ]
    
    this.setData({
      healthRecords: healthRecords
    })
  },

  onTabChange: function(e) {
    this.setData({
      activeTab: e.detail.value
    })
  },

  addRecord: function() {
    wx.navigateTo({
      url: '/pages/growth/add-growth'
    })
  },

  viewGrowthChart: function() {
    wx.navigateTo({
      url: '/pages/growth/chart'
    })
  },

  editRecord: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/growth/edit-growth?id=${id}`
    })
  },

  deleteRecord: function(e) {
    const id = e.currentTarget.dataset.id
    const that = this
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条成长记录吗？',
      success: function(res) {
        if (res.confirm) {
          // 模拟删除操作
          const records = that.data.growthRecordsList.filter(item => item.id !== id)
          that.setData({
            growthRecordsList: records,
            growthRecords: records.length
          })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  viewMilestone: function(e) {
    const id = e.currentTarget.dataset.id
    const milestone = this.data.milestonesList.find(item => item.id === id)
    
    if (milestone) {
      wx.showModal({
        title: milestone.title,
        content: `日期：${milestone.date}\n状态：${milestone.statusText}`,
        showCancel: false
      })
    }
  },

  addMilestone: function() {
    wx.navigateTo({
      url: '/pages/milestone/add-milestone'
    })
  },

  addHealthRecord: function() {
    wx.navigateTo({
      url: '/pages/health/add-health'
    })
  },

  editHealthRecord: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/health/edit-health?id=${id}`
    })
  }
})