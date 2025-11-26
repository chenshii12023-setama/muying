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
    
    // [已修复] 函数名修正：调用底部定义的 testBackendConnection
    this.testBackendConnection()
    
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
      // 注意：这里使用了 globalData.supabase
      this.globalData.supabase.testConnection().then(async (useLocal) => {
        this.globalData.backendConnected = !useLocal
        this.globalData.useLocalStorage = useLocal
        console.log('🔗 后端连接状态:', useLocal ? '本地存储模式' : 'Supabase 模式')
        
        // 检查登录状态
        await this.checkLoginStatus()
      }).catch(async (error) => {
        console.warn('⚠️ 连接测试失败，使用本地存储模式:', error.message)
        this.globalData.useLocalStorage = true
        
        // 即使连接失败也要检查登录状态
        await this.checkLoginStatus()
      })
      
      console.log('✅ 应用初始化完成')
    } catch (error) {
      console.error('❌ 应用初始化失败:', error)
      // 即使初始化失败，也要确保基础功能可用
      this.initData()
    }
  },

  onShow: function (options) {
    console.log('小程序进入前台')
  },

  onHide: function () {
    console.log('小程序进入后台')
  },

  onError: function (msg) {
    console.error('小程序发生错误：', msg)
    // 避免在启动时的某些错误无限弹窗，稍微过滤一下
    if (msg.includes('testNetworkConnection')) return; 
    
    wx.showToast({
      title: '程序出现异常，请稍后重试',
      icon: 'none'
    })
  },

  getSystemInfo: function() {
    try {
      // 使用新的 API 替换废弃的 wx.getSystemInfoSync
      const systemInfo = {
        ...wx.getSystemSetting(),
        ...wx.getDeviceInfo(),
        ...wx.getWindowInfo(),
        ...wx.getAppBaseInfo()
      }
      this.globalData.systemInfo = systemInfo
      console.log('系统信息：', systemInfo)
    } catch (e) {
      // 兼容处理：如果新 API 不可用，回退到旧 API
      try {
        const systemInfo = wx.getSystemInfoSync()
        this.globalData.systemInfo = systemInfo
        console.log('系统信息：', systemInfo)
      } catch (fallbackError) {
        console.error('获取系统信息失败：', fallbackError)
      }
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
        
        // 先尝试从本地存储获取用户资料，如果不存在则创建新的
        try {
          let userProfile = wx.getStorageSync('userProfile')
          
          if (!userProfile) {
            console.log('用户资料不存在，创建新资料...')
            userProfile = await this.createOrUpdateProfile(userInfo)
            // 保存到本地存储
            wx.setStorageSync('userProfile', userProfile)
          }
          
          this.globalData.userProfile = userProfile
          
          // 加载用户的宝宝列表（使用 userProfile 的 id）
          const profileId = this.globalData.userProfile.id
          if (profileId && !this.globalData.useLocalStorage) {
            try {
              const babies = await this.globalData.supabase.getUserBabies(profileId)
              this.globalData.babies = babies || []
            } catch (error) {
              console.log('加载宝宝数据失败:', error)
              this.globalData.babies = []
            }
          } else {
            this.globalData.babies = []
          }
          
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
    this.initDefaultData()
    if (this.isDevMode()) {
      this.initDemoData()
    }
  },

  initDefaultData: function() {
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
    try {
      const accountInfo = wx.getAccountInfoSync()
      return accountInfo.miniProgram.envVersion === 'develop'
    } catch (e) {
      return false
    }
  },

  getUserInfo: function() {
    return this.globalData.userInfo || wx.getStorageSync('userInfo')
  },

  getUserProfile: function() {
    return this.globalData.userProfile || this.globalData.userInfo
  },

  setUserInfo: function(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  getBabyInfo: function() {
    return this.globalData.babyInfo || this.globalData.currentBaby || wx.getStorageSync('currentBaby') || wx.getStorageSync('babyInfo')
  },

  getCurrentBaby: function() {
    return this.globalData.currentBaby || this.globalData.babyInfo
  },

  getBabies: function() {
    return this.globalData.babies || []
  },

  setBabyInfo: function(babyInfo) {
    console.warn('setBabyInfo已废弃，请使用setCurrentBaby')
    this.globalData.babyInfo = babyInfo
    wx.setStorageSync('babyInfo', babyInfo)
  },

  getToken: function() {
    return this.globalData.token || wx.getStorageSync('token')
  },

  setToken: function(token) {
    this.globalData.token = token
    wx.setStorageSync('token', token)
  },

  isLoggedIn: function() {
    return this.globalData.isLoggedIn && !!this.getToken()
  },

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

  async onLoginSuccess(userInfo, token) {
    try {
      this.globalData.userInfo = userInfo
      this.globalData.token = token
      this.globalData.isLoggedIn = true
      
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('token', token)
      
      await this.checkLoginStatus()
      
      console.log('登录成功，用户资料已更新')
      return true
    } catch (error) {
      console.error('登录后处理失败:', error)
      return false
    }
  },

  logout() {
    try {
      this.globalData.userInfo = null
      this.globalData.babyInfo = null
      this.globalData.currentBaby = null
      this.globalData.userProfile = null
      this.globalData.babies = []
      this.globalData.token = null
      this.globalData.isLoggedIn = false
      
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

  clearLoginStatus() {
    this.logout()
  },

  async createOrUpdateProfile(userInfo) {
    try {
      const useLocalStorage = await this.globalData.supabase.testConnection()
      if (useLocalStorage) {
        console.log('📱 使用本地存储模式，创建本地用户资料')
        throw new Error('LOCAL_STORAGE_MODE')
      }
      
      const profileData = {
        nickname: userInfo.nickName || userInfo.nickname || '宝妈',
        avatar_url: userInfo.avatar || userInfo.avatarUrl || '',
        phone_number: userInfo.phoneNumber || '',
        email: userInfo.email || '',
        created_at: new Date().toISOString()
        // 注意：user_id 通常由 Supabase Auth 自动处理，或者需要在 RLS 策略中允许 Anon 角色插入
      }
      
      console.log('📤 尝试创建用户资料到Supabase:', profileData)
      
      const profile = await this.globalData.supabase.request('/rest/v1/profiles', 'POST', profileData)
      
      if (profile && profile.length > 0) {
        console.log('✅ Supabase用户资料创建成功:', profile[0])
        return profile[0]
      } else if (profile) {
         // 有时候 POST 返回的是对象而不是数组
         return profile;
      } else {
        throw new Error('Supabase返回空结果')
      }
    } catch (error) {
      console.error('创建/更新用户资料失败:', error)
      
      const localProfile = {
        id: 'fallback_' + Date.now(),
        user_id: userInfo.id || userInfo.userId,
        nickname: userInfo.nickName || userInfo.nickname || '宝妈',
        avatar_url: userInfo.avatar || userInfo.avatarUrl || '',
        phone_number: userInfo.phoneNumber || '',
        created_at: new Date().toISOString()
      }
      
      if (error.message === 'LOCAL_STORAGE_MODE') {
        console.log('📱 创建本地用户资料:', localProfile)
      } else {
        console.warn('⚠️ 降级到本地用户资料:', localProfile)
      }
      return localProfile
    }
  },

  setCurrentBaby(baby) {
    this.globalData.currentBaby = baby
    this.globalData.babyInfo = baby
    wx.setStorageSync('currentBaby', baby)
    console.log('当前宝宝已更新:', baby.name)
  },

  async updateBabyInfo(babyId, updates) {
    try {
      const updatedBaby = await this.globalData.supabase.updateBaby(babyId, updates)
      
      if (this.globalData.currentBaby && this.globalData.currentBaby.id === babyId) {
        this.globalData.currentBaby = { ...this.globalData.currentBaby, ...updates }
        this.globalData.babyInfo = this.globalData.currentBaby
        wx.setStorageSync('currentBaby', this.globalData.currentBaby)
      }
      
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

  async addBaby(babyData) {
    try {
      if (!this.globalData.userProfile) {
        console.log('用户资料不存在，创建临时资料...')
        const tempUser = {
          id: 'temp_user_' + Date.now(),
          nickName: '临时用户'
        }
        this.globalData.userProfile = await this.createOrUpdateProfile(tempUser)
      }
      
      const profileId = this.globalData.userProfile.id || this.globalData.userProfile.user_id
      
      const newBaby = await this.globalData.supabase.createBaby(profileId, babyData)
      
      this.globalData.babies.unshift(newBaby)
      
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

  // [警告] 此 request 封装在 api.js 面前可能多余，建议优先使用 api.js
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

  getAppStatus: function() {
    return {
      isLoggedIn: this.isLoggedIn(),
      hasBaby: !!this.getCurrentBaby(),
      babyCount: this.getBabies().length,
      useLocalStorage: this.globalData.useLocalStorage,
      backendConnected: this.globalData.backendConnected
    }
  },

  async refreshUserData() {
    try {
      if (!this.isLoggedIn()) {
        return false
      }
      await this.checkLoginStatus()
      console.log('用户数据刷新完成')
      return true
    } catch (error) {
      console.error('刷新用户数据失败:', error)
      return false
    }
  },

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
   * 这里就是 onLaunch 应该调用的函数
   */
  async testBackendConnection() {
    console.log('测试后端连接...')
    
    try {
      // 使用 Supabase 配置中的 testConnection
      const useLocalStorage = await this.globalData.supabase.testConnection()
      this.globalData.useLocalStorage = useLocalStorage
      this.globalData.backendConnected = !useLocalStorage
      
      if (useLocalStorage) {
        console.log('使用本地存储模式')
        // 开发环境不频繁弹窗
        if (!this.isDevMode()) {
          wx.showToast({
            title: '使用离线模式',
            icon: 'none',
            duration: 2000
          })
        }
      } else {
        console.log('后端连接成功')
        // 测试获取辅食食谱，确认数据读取权限
        const recipes = await this.globalData.supabase.getBabyFoodRecipes({})
        console.log('获取到食谱数量:', recipes ? recipes.length : 0)
      }
    } catch (error) {
      console.error('测试后端连接失败:', error)
      this.globalData.backendConnected = false
      this.globalData.useLocalStorage = true
      
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