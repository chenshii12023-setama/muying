const app = getApp()

Page({
  data: {
    activeTab: 'info',
    babyInfo: {},
    growthRecords: 0,
    milestones: 0,
    growthRecordsList: [],
    milestonesList: [],
    healthRecords: [],
    babies: [],
    currentBabyIndex: 0,
    showBabySelector: false
  },

  onLoad: function(options) {
    if (options.tab) {
      this.setData({
        activeTab: options.tab
      })
    }
    
    this.loadBabies()
    this.loadBabyInfo()
    this.loadGrowthRecords()
    this.loadMilestones()
    this.loadHealthRecords()
  },

  onShow: function() {
    this.loadBabies()
    this.loadBabyInfo()
    this.loadGrowthRecords()
    this.loadMilestones()
    this.loadHealthRecords()
  },

  // 加载所有宝宝
  async loadBabies() {
    try {
      // 检查用户是否已登录
      if (!app.globalData.userProfile) {
        console.log('用户未登录，使用模拟数据')
        this.loadMockBabies()
        return
      }
      
      const profileId = app.globalData.userProfile.id || app.globalData.userProfile.user_id
      
      if (!profileId) {
        console.log('无法获取用户ID，使用模拟数据')
        this.loadMockBabies()
        return
      }
      const result = await wx.request({
        url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies?profile_id=eq.${profileId}&select=*&order=created_at.desc`,
        method: 'GET',
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (result.statusCode === 200 && result.data.length > 0) {
        const babies = result.data
        let currentIndex = 0
        
        // 找到当前选中的宝宝
        const currentBaby = app.globalData.currentBaby || wx.getStorageSync('currentBaby')
        if (currentBaby) {
          currentIndex = babies.findIndex(baby => baby.id === currentBaby.id)
          if (currentIndex === -1) currentIndex = 0
        }
        
        this.setData({
          babies: babies,
          currentBabyIndex: currentIndex
        })
        
        // 更新全局数据
        app.globalData.babies = babies
        if (babies.length > 0) {
          app.globalData.currentBaby = babies[currentIndex]
          app.globalData.babyInfo = babies[currentIndex]
          wx.setStorageSync('currentBaby', babies[currentIndex])
        }
      } else {
        this.setData({
          babies: [],
          currentBabyIndex: -1
        })
      }
    } catch (error) {
      console.error('加载宝宝列表失败:', error)
      this.loadMockBabies()
    }
  },

  // 加载模拟宝宝数据
  loadMockBabies() {
    const mockBabies = [
      {
        id: 'mock-1',
        name: '宝宝',
        gender: 'male',
        birth_date: '2024-01-01',
        age: 6,
        weight: 7.5,
        height: 65,
        head_size: 42,
        avatar: '',
        avatarText: '👶'
      }
    ]
    
    this.setData({
      babies: mockBabies,
      currentBabyIndex: 0
    })
    
    // 更新全局数据
    app.globalData.babies = mockBabies
    app.globalData.currentBaby = mockBabies[0]
    app.globalData.babyInfo = mockBabies[0]
    wx.setStorageSync('currentBaby', mockBabies[0])
    
    console.log('已加载模拟宝宝数据')
  },

  // 显示宝宝选择器
  showBabySelector() {
    this.setData({
      showBabySelector: true
    })
  },

  // 隐藏宝宝选择器
  hideBabySelector() {
    this.setData({
      showBabySelector: false
    })
  },

  // 选择宝宝
  selectBaby(e) {
    const index = e.currentTarget.dataset.index
    const baby = this.data.babies[index]
    
    this.setData({
      currentBabyIndex: index,
      showBabySelector: false
    })
    
    // 更新全局数据
    app.globalData.currentBaby = baby
    app.globalData.babyInfo = baby
    wx.setStorageSync('currentBaby', baby)
    
    // 重新加载当前宝宝的数据
    this.loadBabyInfo()
    this.loadGrowthRecords()
    this.loadMilestones()
    this.loadHealthRecords()
  },

  // 跳转到添加宝宝页面
  goToAddBaby() {
    wx.navigateTo({
      url: '/pages/baby/add-baby'
    })
  },

  // 编辑当前宝宝信息
  editCurrentBaby() {
    if (this.data.babies.length === 0) return
    
    const currentBaby = this.data.babies[this.data.currentBabyIndex]
    wx.navigateTo({
      url: `/pages/baby/edit-baby?id=${currentBaby.id}`
    })
  },

  // 删除当前宝宝
  deleteCurrentBaby() {
    if (this.data.babies.length === 0) return
    
    const currentBaby = this.data.babies[this.data.currentBabyIndex]
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除宝宝"${currentBaby.name}"吗？此操作不可恢复。`,
      confirmColor: '#FF6B95',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.request({
              url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies?id=eq.${currentBaby.id}`,
              method: 'DELETE',
              header: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
                'Content-Type': 'application/json'
              }
            })
            
            if (result.statusCode === 204) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              
              // 重新加载宝宝列表
              setTimeout(() => {
                this.loadBabies()
                this.loadBabyInfo()
              }, 1000)
            } else {
              throw new Error('删除失败')
            }
          } catch (error) {
            console.error('删除宝宝失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
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

  async loadGrowthRecords() {
    try {
      const currentBaby = this.data.babies[this.data.currentBabyIndex]
      if (!currentBaby) {
        console.log('没有选中宝宝，使用模拟数据')
        this.loadMockGrowthRecords()
        return
      }

      // 如果是模拟数据，直接加载模拟记录
      if (currentBaby.id && currentBaby.id.startsWith('mock-')) {
        console.log('检测到模拟宝宝数据，加载模拟成长记录')
        this.loadMockGrowthRecords()
        return
      }

      const result = await wx.request({
        url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/baby_growth_records?baby_id=eq.${currentBaby.id}&select=*&order=record_date.desc`,
        method: 'GET',
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (result.statusCode === 200) {
        const records = result.data.map(record => ({
          id: record.id,
          date: record.record_date,
          weight: record.weight,
          height: record.height,
          headSize: record.head_size
        }))
        
        this.setData({
          growthRecordsList: records,
          growthRecords: records.length
        })
      } else {
        throw new Error('加载成长记录失败')
      }
    } catch (error) {
      console.error('加载成长记录失败:', error)
      this.loadMockGrowthRecords()
    }
  },

  // 加载模拟成长记录
  loadMockGrowthRecords() {
    const records = [
      {
        id: 'mock-growth-1',
        date: '2024-01-15',
        weight: 3.8,
        height: 52,
        headSize: 36
      },
      {
        id: 'mock-growth-2',
        date: '2024-02-15',
        weight: 5.2,
        height: 58,
        headSize: 38
      },
      {
        id: 'mock-growth-3',
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

  async loadMilestones() {
    try {
      const currentBaby = this.data.babies[this.data.currentBabyIndex]
      if (!currentBaby) {
        console.log('没有选中宝宝，使用模拟数据')
        this.loadMockMilestones()
        return
      }

      // 如果是模拟数据，直接加载模拟记录
      if (currentBaby.id && currentBaby.id.startsWith('mock-')) {
        console.log('检测到模拟宝宝数据，加载模拟里程碑')
        this.loadMockMilestones()
        return
      }

      const result = await wx.request({
        url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/milestones?baby_id=eq.${currentBaby.id}&select=*&order=milestone_date.desc`,
        method: 'GET',
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (result.statusCode === 200) {
        const milestones = result.data.map(milestone => ({
          id: milestone.id,
          title: milestone.title,
          icon: milestone.icon || '🎯',
          date: milestone.milestone_date || '待完成',
          status: milestone.status || 'pending',
          statusText: milestone.status === 'achieved' ? '已达成' : 
                     milestone.status === 'in_progress' ? '进行中' : '未开始'
        }))
        
        this.setData({
          milestonesList: milestones,
          milestones: milestones.filter(item => item.status === 'achieved').length
        })
      } else {
        throw new Error('加载里程碑失败')
      }
    } catch (error) {
      console.error('加载里程碑失败:', error)
      this.loadMockMilestones()
    }
  },

  // 加载模拟里程碑
  loadMockMilestones() {
    const milestones = [
      {
        id: 'mock-milestone-1',
        title: '第一次翻身',
        icon: '🔄',
        date: '2024-02-10',
        status: 'achieved',
        statusText: '已达成'
      },
      {
        id: 'mock-milestone-2',
        title: '第一次笑出声',
        icon: '😄',
        date: '2024-02-20',
        status: 'achieved',
        statusText: '已达成'
      },
      {
        id: 'mock-milestone-3',
        title: '第一次坐立',
        icon: '🧘',
        date: '待完成',
        status: 'pending',
        statusText: '进行中'
      },
      {
        id: 'mock-milestone-4',
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

  async loadHealthRecords() {
    try {
      const currentBaby = this.data.babies[this.data.currentBabyIndex]
      if (!currentBaby) {
        console.log('没有选中宝宝，使用模拟数据')
        this.loadMockHealthRecords()
        return
      }

      // 如果是模拟数据，直接加载模拟记录
      if (currentBaby.id && currentBaby.id.startsWith('mock-')) {
        console.log('检测到模拟宝宝数据，加载模拟健康记录')
        this.loadMockHealthRecords()
        return
      }

      const result = await wx.request({
        url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/health_records?baby_id=eq.${currentBaby.id}&select=*&order=record_date.desc`,
        method: 'GET',
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (result.statusCode === 200) {
        const healthRecords = result.data.map(record => ({
          id: record.id,
          type: record.record_type || '健康记录',
          date: record.record_date,
          details: record.details || record.description
        }))
        
        this.setData({
          healthRecords: healthRecords
        })
      } else {
        throw new Error('加载健康记录失败')
      }
    } catch (error) {
      console.error('加载健康记录失败:', error)
      this.loadMockHealthRecords()
    }
  },

  // 加载模拟健康记录
  loadMockHealthRecords() {
    const healthRecords = [
      {
        id: 'mock-health-1',
        type: '疫苗接种',
        date: '2024-01-20',
        details: '乙肝疫苗第一针'
      },
      {
        id: 'mock-health-2',
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
    // 创建一个简单的添加记录对话框
    const currentBaby = this.data.babies[this.data.currentBabyIndex]
    if (!currentBaby) {
      wx.showToast({
        title: '请先选择宝宝',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '添加成长记录',
      content: '此功能将跳转到添加成长记录页面',
      confirmText: '跳转',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 暂时使用快速添加方式
          this.quickAddGrowthRecord()
        }
      }
    })
  },

  // 快速添加成长记录
  async quickAddGrowthRecord() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const currentBaby = this.data.babies[this.data.currentBabyIndex]
      
      if (!currentBaby) {
        wx.showToast({
          title: '请先选择宝宝',
          icon: 'none'
        })
        return
      }
      
      if (currentBaby.id && currentBaby.id.startsWith('mock-')) {
        wx.showToast({
          title: '演示模式，无法添加',
          icon: 'none'
        })
        return
      }
      
      // 模拟添加记录的数据
      const newRecord = {
        baby_id: currentBaby.id,
        record_date: today,
        weight: Math.random() * 5 + 3, // 随机体重
        height: Math.floor(Math.random() * 20 + 50), // 随机身高
        head_size: Math.random() * 5 + 35 // 随机头围
      }
      
      const result = await wx.request({
        url: 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/baby_growth_records',
        method: 'POST',
        data: newRecord,
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (result.statusCode === 201) {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
        
        // 重新加载成长记录
        this.loadGrowthRecords()
      } else {
        throw new Error('添加失败')
      }
    } catch (error) {
      console.error('添加成长记录失败:', error)
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      })
    }
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

  async deleteRecord(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条成长记录吗？',
      confirmColor: '#FF6B95',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await wx.request({
              url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/baby_growth_records?id=eq.${id}`,
              method: 'DELETE',
              header: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
                'Content-Type': 'application/json'
              }
            })
            
            if (result.statusCode === 204) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              
              // 重新加载成长记录
              this.loadGrowthRecords()
            } else {
              throw new Error('删除失败')
            }
          } catch (error) {
            console.error('删除成长记录失败:', error)
            // 如果数据库删除失败，执行本地删除作为降级
            const records = this.data.growthRecordsList.filter(item => item.id !== id)
            this.setData({
              growthRecordsList: records,
              growthRecords: records.length
            })
            
            wx.showToast({
              title: '删除成功（本地）',
              icon: 'success'
            })
          }
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
        confirmText: '删除',
        cancelText: '关闭',
        confirmColor: '#FF6B95',
        success: (res) => {
          if (res.confirm) {
            this.deleteMilestone(id)
          }
        }
      })
    }
  },

  // 删除里程碑
  async deleteMilestone(id) {
    try {
      const result = await wx.request({
        url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/milestones?id=eq.${id}`,
        method: 'DELETE',
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (result.statusCode === 204) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
        // 重新加载里程碑
        this.loadMilestones()
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error('删除里程碑失败:', error)
      // 如果数据库删除失败，执行本地删除作为降级
      const milestones = this.data.milestonesList.filter(item => item.id !== id)
      this.setData({
        milestonesList: milestones,
        milestones: milestones.filter(item => item.status === 'achieved').length
      })
      
      wx.showToast({
        title: '删除成功（本地）',
        icon: 'success'
      })
    }
  },

  addMilestone: function() {
    const currentBaby = this.data.babies[this.data.currentBabyIndex]
    if (!currentBaby) {
      wx.showToast({
        title: '请先选择宝宝',
        icon: 'none'
      })
      return
    }

    // 快速添加里程碑
    this.quickAddMilestone()
  },

  // 快速添加里程碑
  async quickAddMilestone() {
    try {
      const currentBaby = this.data.babies[this.data.currentBabyIndex]
      const today = new Date().toISOString().split('T')[0]
      
      if (!currentBaby) {
        wx.showToast({
          title: '请先选择宝宝',
          icon: 'none'
        })
        return
      }
      
      if (currentBaby.id && currentBaby.id.startsWith('mock-')) {
        wx.showToast({
          title: '演示模式，无法添加',
          icon: 'none'
        })
        return
      }
      
      // 模拟添加里程碑的数据
      const milestoneOptions = [
        { title: '第一次翻身', icon: '🔄' },
        { title: '第一次笑出声', icon: '😄' },
        { title: '第一次坐立', icon: '🧘' },
        { title: '第一次爬行', icon: '🐢' },
        { title: '第一次站立', icon: '🚶' },
        { title: '第一次走路', icon: '👶' }
      ]
      
      const randomMilestone = milestoneOptions[Math.floor(Math.random() * milestoneOptions.length)]
      
      const newMilestone = {
        baby_id: currentBaby.id,
        title: randomMilestone.title,
        icon: randomMilestone.icon,
        milestone_date: today,
        status: 'achieved'
      }
      
      const result = await wx.request({
        url: 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/milestones',
        method: 'POST',
        data: newMilestone,
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (result.statusCode === 201) {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
        
        // 重新加载里程碑
        this.loadMilestones()
      } else {
        throw new Error('添加失败')
      }
    } catch (error) {
      console.error('添加里程碑失败:', error)
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      })
    }
  },

  addHealthRecord: function() {
    const currentBaby = this.data.babies[this.data.currentBabyIndex]
    if (!currentBaby) {
      wx.showToast({
        title: '请先选择宝宝',
        icon: 'none'
      })
      return
    }

    // 快速添加健康记录
    this.quickAddHealthRecord()
  },

  // 快速添加健康记录
  async quickAddHealthRecord() {
    try {
      const currentBaby = this.data.babies[this.data.currentBabyIndex]
      const today = new Date().toISOString().split('T')[0]
      
      if (!currentBaby) {
        wx.showToast({
          title: '请先选择宝宝',
          icon: 'none'
        })
        return
      }
      
      if (currentBaby.id && currentBaby.id.startsWith('mock-')) {
        wx.showToast({
          title: '演示模式，无法添加',
          icon: 'none'
        })
        return
      }
      
      // 模拟添加健康记录的数据
      const healthOptions = [
        { type: '疫苗接种', details: '乙肝疫苗第一针' },
        { type: '体检', details: '常规体检，生长发育正常' },
        { type: '疾病记录', details: '轻微感冒，已康复' },
        { type: '用药记录', details: '退烧药，遵医嘱服用' },
        { type: '过敏记录', details: '轻微皮肤过敏，已处理' }
      ]
      
      const randomHealth = healthOptions[Math.floor(Math.random() * healthOptions.length)]
      
      const newHealthRecord = {
        baby_id: currentBaby.id,
        record_type: randomHealth.type,
        record_date: today,
        details: randomHealth.details
      }
      
      const result = await wx.request({
        url: 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/health_records',
        method: 'POST',
        data: newHealthRecord,
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA7OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (result.statusCode === 201) {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
        
        // 重新加载健康记录
        this.loadHealthRecords()
      } else {
        throw new Error('添加失败')
      }
    } catch (error) {
      console.error('添加健康记录失败:', error)
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      })
    }
  },

  editHealthRecord: function(e) {
    const id = e.currentTarget.dataset.id
    const healthRecord = this.data.healthRecords.find(item => item.id === id)
    
    if (healthRecord) {
      wx.showModal({
        title: healthRecord.type,
        content: `日期：${healthRecord.date}
详情：${healthRecord.details}`,
        confirmText: '删除',
        cancelText: '关闭',
        confirmColor: '#FF6B95',
        success: (res) => {
          if (res.confirm) {
            this.deleteHealthRecord(id)
          }
        }
      })
    }
  },

  // 删除健康记录
  async deleteHealthRecord(id) {
    try {
      const result = await wx.request({
        url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/health_records?id=eq.${id}`,
        method: 'DELETE',
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (result.statusCode === 204) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
        // 重新加载健康记录
        this.loadHealthRecords()
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error('删除健康记录失败:', error)
      // 如果数据库删除失败，执行本地删除作为降级
      const healthRecords = this.data.healthRecords.filter(item => item.id !== id)
      this.setData({
        healthRecords: healthRecords
      })
      
      wx.showToast({
        title: '删除成功（本地）',
        icon: 'success'
      })
    }
  }
})