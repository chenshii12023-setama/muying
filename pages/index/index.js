// pages/index/index.js
const app = getApp()
const SupabaseAPI = require('../../supabase_config.js')

Page({
  data: {
    // 页面核心数据
    userInfo: {},
    babyInfo: null, // 初始设为 null，方便判断状态
    
    // 育儿知识数据
    currentMonthKnowledge: null, 
    selectedItems: [],
    
    // 月份选择器数据 (1-36个月)
    monthRange: Array.from({length: 36}, (_, i) => (i + 1) + '个月'),
    monthIndex: 0, 
    
    // UI 状态
    isLoading: false
  },

  onLoad: function() {
    this.loadUserInfo()
  },

  // 每次页面显示时触发
  onShow: function() {
    this.checkAndSyncBaby()
  },

  onPullDownRefresh: function() {
    // 下拉刷新强制更新，忽略 ID 对比
    this.forceRefresh().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // ---------------------------------------------------------
  // 1. 智能同步逻辑 (解决卡顿核心)
  // ---------------------------------------------------------
  checkAndSyncBaby: function() {
    // 1. 获取全局选中的宝宝
    const globalBaby = app.getCurrentBaby()
    
    // 2. 获取当前页面显示的宝宝
    const currentDisplayBaby = this.data.babyInfo

    // 3. 【防卡顿关键】如果 ID 没变，且育儿知识已有数据，则什么都不做
    if (globalBaby && currentDisplayBaby && globalBaby.id === currentDisplayBaby.id) {
      if (this.data.currentMonthKnowledge) {
        return // 数据一致，无需刷新，直接返回
      }
    }

    // 4. 如果 ID 变了，或者页面没数据，才执行刷新
    console.log('首页检测到宝宝切换/数据过期，开始刷新...')
    this.updateUI(globalBaby)
  },

  // 强制刷新 (用于下拉刷新)
  forceRefresh: async function() {
    const globalBaby = app.getCurrentBaby()
    await this.updateUI(globalBaby)
  },

  // 更新界面逻辑
  async updateUI(baby) {
    // 情况 A: 没有宝宝信息
    if (!baby) {
      this.setData({ 
        babyInfo: { name: '待添加', age: 0, avatarText: '➕' },
        currentMonthKnowledge: null 
      })
      return
    }

    // 情况 B: 有宝宝，先计算安全月龄
    // 确保 age 是数字，且在 1-36 之间
    let safeMonth = parseInt(baby.age) || 1
    if (safeMonth < 1) safeMonth = 1
    if (safeMonth > 36) safeMonth = 36

    // 1. 【优先渲染】先更新基本信息，让界面不卡顿
    this.setData({ 
      babyInfo: baby,
      monthIndex: safeMonth - 1, // 修正选择器位置
      isLoading: true
    })

    // 2. 【异步加载】再去请求网络数据
    await this.loadGrowthKnowledge(safeMonth)
  },

  // ---------------------------------------------------------
  // 2. 加载育儿知识
  // ---------------------------------------------------------
  async loadGrowthKnowledge(monthAge) {
    try {
      // 使用 SupabaseAPI 请求
      const result = await SupabaseAPI.request(`/rest/v1/baby_growth_standards?month_age=eq.${monthAge}`)
      
      if (result && result.length > 0) {
        // 数据清洗
        this.processKnowledgeData(result[0].content, monthAge)
      } else {
        // 没查到数据（可能是新月龄还没生成），清空知识区域
        this.setData({ currentMonthKnowledge: null })
      }
    } catch (error) {
      console.error('育儿知识加载失败:', error)
      // 出错时不清空旧数据，防止闪烁，只弹提示
      // wx.showToast({ title: '网络稍慢', icon: 'none' })
    } finally {
      // 无论成功失败，都关闭 Loading
      this.setData({ isLoading: false })
    }
  },

  // 数据格式化 (保持之前的修复逻辑)
  processKnowledgeData: function(content, monthAge) {
    if (!content) return

    const formattedData = {
      month: monthAge,
      skills: this.formatItem(content.skills),
      nutrition: this.formatItem(content.nutrition),
      sleep: this.formatItem(content.sleep),
      warning: this.formatItem(content.warning)
    }

    this.setData({
      currentMonthKnowledge: formattedData,
      selectedItems: [] 
    })
  },

  // 万能格式化函数
  formatItem: function(data) {
    if (!data) return []
    if (Array.isArray(data)) {
      return data.map(item => ({ text: String(item), selected: false }))
    }
    if (typeof data === 'string') {
      return [{ text: data, selected: false }]
    }
    return [{ text: String(data), selected: false }]
  },

  // ---------------------------------------------------------
  // 3. 交互事件
  // ---------------------------------------------------------
  
  // 切换月份选择器
  onMonthChange: function(e) {
    const index = parseInt(e.detail.value)
    const selectedMonth = index + 1
    
    // UI 立即响应
    this.setData({ monthIndex: index })

    // 发起请求
    this.loadGrowthKnowledge(selectedMonth)
  },

  navigate: function(e) {
    const url = e.currentTarget.dataset.url
    if (url) wx.navigateTo({ url })
  },

  showDevToast: function() {
    wx.showToast({ title: '功能开发中', icon: 'none' })
  },

  toggleKnowledgeItem: function(e) {
    const { category, index } = e.currentTarget.dataset
    const key = `currentMonthKnowledge.${category}[${index}].selected`
    this.setData({ [key]: !this.data.currentMonthKnowledge[category][index].selected })
    this.updateSelectedList()
  },

  updateSelectedList: function() {
    const k = this.data.currentMonthKnowledge
    if (!k) return
    let list = []
    ;['skills', 'nutrition', 'sleep', 'warning'].forEach(cat => {
      if (k[cat]) {
        k[cat].forEach(item => { if (item.selected) list.push(item) })
      }
    })
    this.setData({ selectedItems: list })
  },

  saveSelectedItems: function() {
    if (this.data.selectedItems.length === 0) return
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  loadUserInfo: function() {
    this.setData({
      userInfo: app.globalData.userInfo || { nickName: '宝妈', avatarUrl: '' }
    })
  }
})