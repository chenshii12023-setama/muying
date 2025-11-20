// app.js
const SupabaseAPI = require('./supabase_config.js')

App({
  globalData: {
    userInfo: null,
    babyInfo: null,
    currentBaby: null, // 当前选中的宝宝
    token: null,
    systemInfo: null,
    supabase: SupabaseAPI,
    backendConnected: false,
    useLocalStorage: false,
    userProfile: null,
    babies: [], // 用户的所有宝宝列表
    isLoggedIn: false
  },

  onLaunch: function () {
    console.log('宝妈育儿轻指南小程序启动')
    
    // 获取系统信息
    this.getSystemInfo()
    
    // 测试后端连接并初始化
    this.initializeApp()
  },

  /**
   * 初始化应用
   */
  async initializeApp() {
    try {
      // 简化的初始化逻辑
      console.log('🚀 开始初始化应用...')
      
      // 获取系统信息
      this.getSystemInfo()
      
      // 初始化基础数据
      this.initData()
      
      // 简单的后端连接测试
      this.globalData.supabase.testConnection().then(useLocal => {
        this.globalData.backendConnected = !useLocal
        this.globalData.useLocalStorage = useLocal
        console.log('🔗 后端连接状态:', useLocal ? '本地存储模式' : 'Supabase 模式')
      }).catch(error => {
        console.warn('⚠️ 连接测试失败，使用本地存储模式:', error.message)
        this.globalData.useLocalStorage = true
      })
      
      console.log('✅ 应用初始化完成')
    } catch (error) {
      console.error('❌ 应用初始化失败:', error)
      // 即使初始化失败，也要确保基础功能可用
      this.initData()
    }
  },

  onShow: function (options) {
    // 小程序从后台进入前台时触发
    console.log('小程序进入前台')
  },

  onHide: function () {
    // 小程序从前台进入后台时触发
    console.log('小程序进入后台')
  },

  onError: function (msg) {
    // 小程序发生脚本错误或API调用失败时触发
    console.error('小程序发生错误：', msg)
    wx.showToast({
      title: '程序出现异常，请稍后重试',
      icon: 'none'
    })
  },

  getSystemInfo: function() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      this.globalData.systemInfo = systemInfo
      console.log('系统信息：', systemInfo)
    } catch (e) {
      console.error('获取系统信息失败：', e)
    }
  },

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token')
      const userInfo = wx.getStorageSync('userInfo')
      const currentBaby = wx.getStorageSync('currentBaby')
      
      if (token && userInfo) {
        this.globalData.token = token
        this.globalData.userInfo = userInfo
        this.globalData.isLoggedIn = true
        
        // 从后端或本地存储加载完整的用户资料
        try {
          const userProfile = await this.globalData.supabase.getUserProfile(userInfo.id || userInfo.userId)
          this.globalData.userProfile = userProfile || userInfo
          
          // 加载用户的宝宝列表
          const babies = await this.globalData.supabase.getUserBabies(userInfo.id || userInfo.userId)
          this.globalData.babies = babies || []
          
          // 设置当前宝宝
          if (currentBaby) {
            this.globalData.currentBaby = currentBaby
            this.globalData.babyInfo = currentBaby
          } else if (babies && babies.length > 0) {
            this.globalData.currentBaby = babies[0]
            this.globalData.babyInfo = babies[0]
          }
          
          console.log('自动登录成功，用户资料已加载')
        } catch (error) {
          console.warn('加载用户资料失败，使用本地缓存:', error)
          // 降级到本地缓存的数据
          this.globalData.babyInfo = currentBaby || wx.getStorageSync('babyInfo')
        }
      } else {
        console.log('用户未登录')
        this.globalData.isLoggedIn = false
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      this.globalData.isLoggedIn = false
    }
  },

  initData: function() {
    // 初始化默认数据
    this.initDefaultData()
    
    // 初始化示例数据（开发环境）
    if (this.isDevMode()) {
      this.initDemoData()
    }
  },

  initDefaultData: function() {
    // 检查并初始化必要的数据结构
    const defaultData = {
      growthRecords: [],
      favoriteTips: [],
      favoritePlaces: [],
      myMarketItems: [],
      soldItems: 0,
      boughtItems: 0
    }
    
    Object.keys(defaultData).forEach(key => {
      if (!wx.getStorageSync(key)) {
        wx.setStorageSync(key, defaultData[key])
      }
    })
  },

  initDemoData: function() {
    // 开发环境下的示例数据
    if (!wx.getStorageSync('demoDataInitialized')) {
      const demoGrowthRecords = [
        {
          id: 1,
          date: '2024-01-15',
          height: 52.5,
          weight: 3.8,
          milestone: '出生',
          notes: '宝宝出生啦！'
        },
        {
          id: 2,
          date: '2024-02-15',
          height: 55.2,
          weight: 4.5,
          milestone: '满月',
          notes: '宝宝满月了，体重增长良好'
        }
      ]
      
      const demoBabyInfo = {
        name: '小宝',
        gender: '男',
        birthDate: '2024-01-15',
        age: 10,
        weight: 8.5,
        height: 68.2
      }
      
      wx.setStorageSync('growthRecords', demoGrowthRecords)
      wx.setStorageSync('babyInfo', demoBabyInfo)
      wx.setStorageSync('demoDataInitialized', true)
      
      console.log('示例数据初始化完成')
    }
  },

  isDevMode: function() {
    // 判断是否为开发环境
    try {
      const accountInfo = wx.getAccountInfoSync()
      return accountInfo.miniProgram.envVersion === 'develop'
    } catch (e) {
      return false
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function() {
    return this.globalData.userInfo || wx.getStorageSync('userInfo')
  },

  /**
   * 获取完整用户资料
   */
  getUserProfile: function() {
    return this.globalData.userProfile || this.globalData.userInfo
  },

  /**
   * 设置用户信息
   */
  setUserInfo: function(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  /**
   * 获取当前宝宝信息
   */
  getBabyInfo: function() {
    return this.globalData.babyInfo || this.globalData.currentBaby || wx.getStorageSync('currentBaby') || wx.getStorageSync('babyInfo')
  },

  /**
   * 获取当前宝宝
   */
  getCurrentBaby: function() {
    return this.globalData.currentBaby || this.globalData.babyInfo
  },

  /**
   * 获取所有宝宝列表
   */
  getBabies: function() {
    return this.globalData.babies || []
  },

  /**
   * 设置宝宝信息（已废弃，使用 setCurrentBaby）
   */
  setBabyInfo: function(babyInfo) {
    console.warn('setBabyInfo已废弃，请使用setCurrentBaby')
    this.globalData.babyInfo = babyInfo
    wx.setStorageSync('babyInfo', babyInfo)
  },

  /**
   * 获取token
   */
  getToken: function() {
    return this.globalData.token || wx.getStorageSync('token')
  },

  /**
   * 设置token
   */
  setToken: function(token) {
    this.globalData.token = token
    wx.setStorageSync('token', token)
  },

  /**
   * 检查是否登录
   */
  isLoggedIn: function() {
    return this.globalData.isLoggedIn && !!this.getToken()
  },

  /**
   * 登录检查
   */
  requireLogin: function(callback) {
    if (this.isLoggedIn()) {
      callback && callback()
    } else {
      wx.showModal({
        title: '需要登录',
        content: '此功能需要登录后才能使用',
        confirmText: '去登录',
        cancelText: '取消',
        confirmColor: '#FF6B95',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }
        }
      })
    }
  },

  /**
   * 登录成功后的处理
   */
  async onLoginSuccess(userInfo, token) {
    try {
      // 保存到全局状态
      this.globalData.userInfo = userInfo
      this.globalData.token = token
      this.globalData.isLoggedIn = true
      
      // 保存到本地存储
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('token', token)
      
      // 加载完整的用户资料和宝宝信息
      await this.checkLoginStatus()
      
      console.log('登录成功，用户资料已更新')
      return true
    } catch (error) {
      console.error('登录后处理失败:', error)
      return false
    }
  },

  /**
   * 退出登录
   */
  logout() {
    try {
      // 清除全局状态
      this.globalData.userInfo = null
      this.globalData.babyInfo = null
      this.globalData.currentBaby = null
      this.globalData.userProfile = null
      this.globalData.babies = []
      this.globalData.token = null
      this.globalData.isLoggedIn = false
      
      // 清除本地存储
      wx.removeStorageSync('userInfo')
      wx.removeStorageSync('babyInfo')
      wx.removeStorageSync('currentBaby')
      wx.removeStorageSync('token')
      wx.removeStorageSync('userProfile')
      
      console.log('已退出登录')
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  },

  /**
   * 清除登录状态
   */
  clearLoginStatus() {
    this.logout()
  },

  /**
   * 设置当前宝宝
   */
  setCurrentBaby(baby) {
    this.globalData.currentBaby = baby
    this.globalData.babyInfo = baby
    wx.setStorageSync('currentBaby', baby)
    console.log('当前宝宝已更新:', baby.name)
  },

  /**
   * 更新宝宝信息
   */
  async updateBabyInfo(babyId, updates) {
    try {
      // 更新到后端
      const updatedBaby = await this.globalData.supabase.updateBaby(babyId, updates)
      
      // 更新全局状态
      if (this.globalData.currentBaby && this.globalData.currentBaby.id === babyId) {
        this.globalData.currentBaby = { ...this.globalData.currentBaby, ...updates }
        this.globalData.babyInfo = this.globalData.currentBaby
        wx.setStorageSync('currentBaby', this.globalData.currentBaby)
      }
      
      // 更新宝宝列表
      const babyIndex = this.globalData.babies.findIndex(baby => baby.id === babyId)
      if (babyIndex >= 0) {
        this.globalData.babies[babyIndex] = { ...this.globalData.babies[babyIndex], ...updates }
      }
      
      console.log('宝宝信息更新成功')
      return updatedBaby
    } catch (error) {
      console.error('更新宝宝信息失败:', error)
      throw error
    }
  },

  /**
   * 添加新宝宝
   */
  async addBaby(babyData) {
    try {
      if (!this.globalData.userProfile) {
        throw new Error('用户资料不存在')
      }
      
      // 添加到后端
      const newBaby = await this.globalData.supabase.createBaby(this.globalData.userProfile.user_id, babyData)
      
      // 更新全局状态
      this.globalData.babies.unshift(newBaby)
      
      // 如果是第一个宝宝，设为当前宝宝
      if (this.globalData.babies.length === 1) {
        this.setCurrentBaby(newBaby)
      }
      
      console.log('新宝宝添加成功:', newBaby.name)
      return newBaby
    } catch (error) {
      console.error('添加宝宝失败:', error)
      throw error
    }
  },

  // 网络请求封装
  request: function(options) {
    const token = this.getToken()
    const header = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url,
        data: options.data,
        header: header,
        method: options.method || 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  /**
   * 统一错误处理
   */
  handleError: function(error) {
    console.error('API调用错误：', error)
    
    let message = '操作失败，请重试'
    
    if (typeof error === 'string') {
      message = error
    } else if (error && error.message) {
      message = error.message
    }
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
    
    return message
  },

  /**
   * 获取应用状态信息
   */
  getAppStatus: function() {
    return {
      isLoggedIn: this.isLoggedIn(),
      hasBaby: !!this.getCurrentBaby(),
      babyCount: this.getBabies().length,
      useLocalStorage: this.globalData.useLocalStorage,
      backendConnected: this.globalData.backendConnected
    }
  },

  /**
   * 刷新用户数据
   */
  async refreshUserData() {
    try {
      if (!this.isLoggedIn()) {
        return false
      }
      
      // 重新检查登录状态，刷新数据
      await this.checkLoginStatus()
      console.log('用户数据刷新完成')
      return true
    } catch (error) {
      console.error('刷新用户数据失败:', error)
      return false
    }
  },

  // 获取当前位置
  getCurrentLocation: function() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude
          })
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  // 检查位置权限
  checkLocationPermission: function() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation']) {
            resolve(true)
          } else {
            resolve(false)
          }
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  },

  // 请求位置权限
  requestLocationPermission: function() {
    return new Promise((resolve) => {
      wx.authorize({
        scope: 'scope.userLocation',
        success: () => {
          resolve(true)
        },
        fail: () => {
          resolve(false)
        }
      })
    })
  },

  /**
   * 测试后端连接
   */
  async testBackendConnection() {
    console.log('测试后端连接...')
    
    try {
      const useLocalStorage = await this.globalData.supabase.testConnection()
      this.globalData.useLocalStorage = useLocalStorage
      this.globalData.backendConnected = !useLocalStorage
      
      if (useLocalStorage) {
        console.log('使用本地存储模式')
        wx.showToast({
          title: '使用离线模式',
          icon: 'none',
          duration: 2000
        })
      } else {
        console.log('后端连接成功')
        // 测试获取辅食食谱
        const recipes = await this.globalData.supabase.getBabyFoodRecipes({})
        console.log('获取到食谱数量:', recipes.length)
      }
    } catch (error) {
      console.error('测试后端连接失败:', error)
      this.globalData.backendConnected = false
      this.globalData.useLocalStorage = true
      
      // 在开发模式下不显示错误提示，避免干扰开发
      if (!this.isDevMode()) {
        wx.showModal({
          title: '网络连接提示',
          content: '当前使用离线模式，部分功能可能受限。',
          showCancel: false
        })
      }
    }
  },
})