// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    babyInfo: {},
    growthRecords: 12,
    milestones: 8,
    nearbyFacilities: 15,
    todayReminders: [
      {
        id: 1,
        title: '宝宝身高体重测量',
        time: '今天 09:00',
        type: 'primary',
        tag: '成长记录'
      },
      {
        id: 2,
        title: '疫苗接种提醒',
        time: '明天 10:30',
        type: 'warning',
        tag: '健康'
      },
      {
        id: 3,
        title: '辅食添加建议',
        time: '今天 12:00',
        type: 'success',
        tag: '营养'
      }
    ],
    knowledgeItems: [
      {
        id: 1,
        title: '宝宝辅食添加全攻略',
        desc: '6个月以上宝宝的辅食添加指南',
        image: '/images/knowledge/baby-food.jpg',
        tags: ['辅食', '营养', '6个月+']
      },
      {
        id: 2,
        title: '如何应对宝宝发烧',
        desc: '宝宝发烧的正确处理方法',
        image: '/images/knowledge/fever.jpg',
        tags: ['健康', '发烧', '护理']
      },
      {
        id: 3,
        title: '宝宝睡眠训练技巧',
        desc: '帮助宝宝建立良好睡眠习惯',
        image: '/images/knowledge/sleep.jpg',
        tags: ['睡眠', '训练', '习惯']
      }
    ],
    functions: [
      {
        id: 1,
        name: '成长记录',
        icon: '📈',
        iconClass: 'primary',
        url: '/pages/baby/baby'
      },
      {
        id: 2,
        name: '里程碑',
        icon: '🏆',
        iconClass: 'success',
        url: '/pages/growth/growth'
      },
      {
        id: 3,
        name: '附近设施',
        icon: '📍',
        iconClass: 'secondary',
        url: '/pages/map/map'
      },
      {
        id: 4,
        name: '闲置市场',
        icon: '🛒',
        iconClass: 'warning',
        url: '/pages/market/market'
      },
      {
        id: 5,
        name: '育儿知识',
        icon: '📚',
        iconClass: 'primary',
        url: '/pages/knowledge/knowledge'
      },
      {
        id: 6,
        name: 'AI助手',
        icon: '🤖',
        iconClass: 'success',
        url: '/pages/ai/ai'
      },
      {
        id: 7,
        name: '营养计算',
        icon: '🍎',
        iconClass: 'secondary',
        url: '/pages/ai/ai?tab=nutrition'
      },
      {
        id: 8,
        name: '我的',
        icon: '👤',
        iconClass: 'warning',
        url: '/pages/user/user'
      }
    ]
  },

  onLoad: function(options) {
    this.loadUserInfo()
    this.loadBabyInfo()
    this.loadReminders()
  },

  onShow: function() {
    this.loadBabyInfo()
  },

  onPullDownRefresh: function() {
    this.loadUserInfo()
    this.loadBabyInfo()
    this.loadReminders()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },

  loadUserInfo: function() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    } else {
      // 模拟用户信息
      this.setData({
        userInfo: {
          nickName: '宝妈',
          avatarUrl: ''
        }
      })
    }
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
            age: 6,
            avatarText: '👶'
          }
        })
      }
    }
  },

  loadReminders: function() {
    // 模拟从服务器获取提醒
    const now = new Date()
    const today = `${now.getMonth() + 1}月${now.getDate()}日`
    
    const reminders = [
      {
        id: 1,
        title: '宝宝身高体重测量',
        time: `${today} 09:00`,
        type: 'primary',
        tag: '成长记录'
      },
      {
        id: 2,
        title: '疫苗接种提醒',
        time: `${now.getMonth() + 1}月${now.getDate() + 1}日 10:30`,
        type: 'warning',
        tag: '健康'
      },
      {
        id: 3,
        title: '辅食添加建议',
        time: `${today} 12:00`,
        type: 'success',
        tag: '营养'
      }
    ]
    
    this.setData({
      todayReminders: reminders
    })
  },

  // 页面跳转
  navigateTo: function(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url: url
      })
    }
  },

  // 查看所有提醒
  viewAllReminders: function() {
    wx.navigateTo({
      url: '/pages/baby/baby?tab=reminders'
    })
  },

  // 处理提醒点击
  handleReminder: function(e) {
    const id = e.currentTarget.dataset.id
    const reminder = this.data.todayReminders.find(item => item.id === id)
    
    if (reminder) {
      wx.showModal({
        title: reminder.title,
        content: `时间：${reminder.time}\n\n点击确定查看详情`,
        success: (res) => {
          if (res.confirm) {
            // 根据提醒类型跳转到不同页面
            if (reminder.type === 'primary') {
              wx.navigateTo({
                url: '/pages/growth/growth'
              })
            } else if (reminder.type === 'warning') {
              wx.navigateTo({
                url: '/pages/baby/baby?tab=health'
              })
            } else {
              wx.navigateTo({
                url: '/pages/knowledge/knowledge'
              })
            }
          }
        }
      })
    }
  },

  // 跳转到育儿知识
  goToKnowledge: function() {
    wx.navigateTo({
      url: '/pages/knowledge/knowledge'
    })
  },

  // 查看知识详情
  viewKnowledge: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/knowledge/knowledge?id=${id}`
    })
  },

  // AI助手
  goToAIAssistant: function() {
    wx.navigateTo({
      url: '/pages/ai/ai'
    })
  },

  // 添加宝宝
  addBaby: function() {
    wx.navigateTo({
      url: '/pages/baby/baby?action=add'
    })
  }
})