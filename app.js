// app.js
const SupabaseAPI = require('./supabase_config.js')

App({
  globalData: {
    userInfo: null,
    currentBaby: null, // 当前选中的宝宝（核心数据）
    babies: [],        // 宝宝列表缓存
    systemInfo: null,
    supabase: SupabaseAPI,
    userProfile: null,
    isLoggedIn: false,
    token: null
  },

  onLaunch: async function () {
    console.log('🚀 小程序启动')
    
    // 1. 获取系统信息
    this.initSystemInfo()
    
    // 2. 恢复登录状态和用户信息
    this.recoverSession()
    
    // 3. 测试后端连接 (静默测试)
    this.testBackendConnection()
  },

  // 初始化系统信息
  initSystemInfo: function() {
    try {
      this.globalData.systemInfo = wx.getSystemInfoSync()
    } catch (e) {
      console.error('获取系统信息失败', e)
    }
  },

  // 从缓存恢复会话
  recoverSession: function() {
    const userInfo = wx.getStorageSync('userInfo')
    const currentBaby = wx.getStorageSync('currentBaby')
    const token = wx.getStorageSync('token')

    if (token && userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.token = token
      this.globalData.isLoggedIn = true
      this.globalData.userProfile = wx.getStorageSync('userProfile')
    }

    // 核心：恢复当前选中的宝宝
    if (currentBaby) {
      this.globalData.currentBaby = currentBaby
      console.log('✅ 恢复当前宝宝:', currentBaby.name)
    }
  },

  // --- 核心状态管理 ---

  // 设置当前宝宝（全局同步入口）
  setCurrentBaby: function(baby) {
    if (!baby) return
    this.globalData.currentBaby = baby
    wx.setStorageSync('currentBaby', baby)
    console.log('🔄 切换当前宝宝为:', baby.name)
  },

  // 获取当前宝宝
  getCurrentBaby: function() {
    return this.globalData.currentBaby || wx.getStorageSync('currentBaby')
  },

  // --- 👇 修复：加回被误删的辅助函数 (兼容其他页面) ---

  // 1. 获取用户信息 (修复 profile.js 报错)
  getUserInfo: function() {
    return this.globalData.userInfo || wx.getStorageSync('userInfo')
  },

  // 2. 兼容旧代码的宝宝获取方法 (Alias to getCurrentBaby)
  getBabyInfo: function() {
    return this.getCurrentBaby()
  },

  // 3. 获取宝宝列表 (修复 profile.js 报错)
  getBabies: function() {
    return this.globalData.babies || []
  },

  // 4. 获取 Token
  getToken: function() {
    return this.globalData.token || wx.getStorageSync('token')
  },

  // 4. 判断是否登录
  isLoggedIn: function() {
    return this.globalData.isLoggedIn && !!this.getToken()
  },

  // 5. 获取用户档案
  getUserProfile: function() {
    return this.globalData.userProfile || this.getUserInfo()
  },

  // 6. 获取应用状态
  getAppStatus: function() {
    return {
      isLoggedIn: this.isLoggedIn(),
      hasUserInfo: !!this.getUserInfo(),
      hasCurrentBaby: !!this.getCurrentBaby(),
      babiesCount: this.getBabies().length
    }
  },

  // 7. 检查登录状态
  checkLoginStatus: function() {
    return new Promise((resolve) => {
      const isLoggedIn = this.isLoggedIn()
      resolve(isLoggedIn)
    })
  },

  // 8. 退出登录
  logout: function() {
    this.globalData.isLoggedIn = false
    this.globalData.token = null
    this.globalData.userInfo = null
    this.globalData.userProfile = null
    
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('userProfile')
    
    console.log('✅ 用户已退出登录')
  },

  // 9. 清除登录状态
  clearLoginStatus: function() {
    this.globalData.isLoggedIn = false
    this.globalData.token = null
  },

  // --- 网络相关 ---

  // 测试后端连接
  async testBackendConnection() {
    try {
      const useLocalStorage = await this.globalData.supabase.testConnection()
      if (!useLocalStorage) {
        console.log('✅ 后端连接成功')
      } else {
        console.warn('⚠️ 使用本地模式')
      }
    } catch (error) {
      console.error('连接测试异常:', error)
    }
  }
})