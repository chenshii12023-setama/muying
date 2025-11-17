// app.js
const SupabaseAPI = require('./supabase_config.js')

App({
  globalData: {
    userInfo: null,
    babyInfo: null,
    token: null,
    systemInfo: null,
    supabase: SupabaseAPI,
    backendConnected: false
  },

  onLaunch: function () {
    // 获取系统信息
    this.getSystemInfo()
    
    // 检查登录状态
    this.checkLoginStatus()
    
    // 初始化数据
    this.initData()
    
    // 测试后端连接
    this.testBackendConnection()
    
    console.log('宝妈育儿轻指南小程序启动成功')
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

  checkLoginStatus: function() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    const babyInfo = wx.getStorageSync('babyInfo')
    
    if (token) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      this.globalData.babyInfo = babyInfo
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

  // 获取用户信息
  getUserInfo: function() {
    return this.globalData.userInfo || wx.getStorageSync('userInfo')
  },

  // 设置用户信息
  setUserInfo: function(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  // 获取宝宝信息
  getBabyInfo: function() {
    return this.globalData.babyInfo || wx.getStorageSync('babyInfo')
  },

  // 设置宝宝信息
  setBabyInfo: function(babyInfo) {
    this.globalData.babyInfo = babyInfo
    wx.setStorageSync('babyInfo', babyInfo)
  },

  // 获取token
  getToken: function() {
    return this.globalData.token || wx.getStorageSync('token')
  },

  // 设置token
  setToken: function(token) {
    this.globalData.token = token
    wx.setStorageSync('token', token)
  },

  // 检查是否登录
  isLoggedIn: function() {
    return !!this.getToken()
  },

  // 登录检查
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

  // 统一错误处理
  handleError: function(error) {
    console.error('API调用错误：', error)
    
    let message = '网络请求失败，请重试'
    
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

  // 测试后端连接
  testBackendConnection: function() {
    console.log('测试后端连接...')
    
    // 测试获取辅食食谱
    SupabaseAPI.getBabyFoodRecipes({})
      .then(recipes => {
        console.log('后端连接成功，获取到食谱数量:', recipes.length)
        this.globalData.backendConnected = true
      })
      .catch(error => {
        console.error('后端连接失败:', error)
        this.globalData.backendConnected = false
        
        // 显示连接失败提示
        wx.showModal({
          title: '后端连接失败',
          content: '无法连接到数据库服务器，请检查网络连接或联系管理员。',
          showCancel: false
        })
      })
  }
})