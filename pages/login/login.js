const app = getApp()

Page({
  data: {
    phoneNumber: '',
    verificationCode: '',
    countdown: 0,
    canSendCode: false,
    canLogin: false,
    isLoggingIn: false,
    agreedToTerms: false,
    showGuide: true,
    showGuideModal: false,
    loginType: 'phone' // 'phone' 或 'wechat'
  },

  onLoad: function(options) {
    // 检查是否已登录
    if (app.isLoggedIn()) {
      // 已登录，直接跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      })
      return
    }
    
    // 检查是否有宝宝信息需要完善
    const needBabyInfo = options.needBabyInfo === 'true'
    if (needBabyInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录并完善宝宝信息',
        showCancel: false
      })
    }
  },

  onPhoneChange: function(e) {
    const phoneNumber = e.detail.value
    const isValidPhone = /^1[3-9]\d{9}$/.test(phoneNumber)
    
    this.setData({
      phoneNumber: phoneNumber,
      canSendCode: isValidPhone && this.data.agreedToTerms
    })
    
    this.checkLoginStatus()
  },

  onCodeChange: function(e) {
    const verificationCode = e.detail.value
    
    this.setData({
      verificationCode: verificationCode
    })
    
    this.checkLoginStatus()
  },

  onAgreementChange: function(e) {
    const agreedToTerms = e.detail.value.length > 0
    
    this.setData({
      agreedToTerms: agreedToTerms,
      canSendCode: this.data.canSendCode && agreedToTerms
    })
    
    this.checkLoginStatus()
  },

  checkLoginStatus: function() {
    const canLogin = this.data.phoneNumber && 
                   this.data.verificationCode && 
                   this.data.verificationCode.length === 6 &&
                   this.data.agreedToTerms
    
    this.setData({
      canLogin: canLogin
    })
  },

  sendVerificationCode: function() {
    if (this.data.countdown > 0) return

    if (!this.data.agreedToTerms) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    // 模拟发送验证码
    wx.showLoading({
      title: '发送中...'
    })

    setTimeout(() => {
      wx.hideLoading()
      
      // 开始倒计时
      this.startCountdown()
      
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
    }, 1000)
  },

  startCountdown: function() {
    this.setData({
      countdown: 60
    })

    const timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(timer)
        this.setData({
          countdown: 0
        })
      } else {
        this.setData({
          countdown: this.data.countdown - 1
        })
      }
    }, 1000)
  },

  /**
   * 手机号登录
   */
  async handleLogin() {
    if (!this.data.canLogin || this.data.isLoggingIn) return

    this.setData({
      isLoggingIn: true
    })

    try {
      // 模拟手机号登录验证
      await this.simulatePhoneLogin()
      
      // 生成用户信息
      const userInfo = {
        id: 'user_' + Date.now(),
        userId: 'user_' + Date.now(),
        phoneNumber: this.data.phoneNumber,
        nickName: `宝妈${this.data.phoneNumber.slice(-4)}`,
        avatar: '/images/default-avatar.png',
        loginTime: new Date().toISOString(),
        loginType: 'phone'
      }

      // 调用app的登录成功处理
      const loginSuccess = await app.onLoginSuccess(userInfo, 'mock_token_' + Date.now())
      
      if (!loginSuccess) {
        throw new Error('登录处理失败')
      }

      this.setData({
        isLoggingIn: false
      })

      // 检查是否需要完善宝宝信息
      await this.checkBabyInfo()

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)

    } catch (error) {
      console.error('登录失败:', error)
      this.setData({
        isLoggingIn: false
      })
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      })
    }
  },

  /**
   * 模拟手机号登录
   */
  async simulatePhoneLogin() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟验证码验证
        if (this.data.verificationCode === '123456') {
          resolve()
        } else {
          throw new Error('验证码错误')
        }
      }, 1000)
    })
  },

  /**
   * 微信登录
   */
  async handleWechatLogin() {
    if (!this.data.agreedToTerms) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '授权中...'
    })

    try {
      // 模拟微信授权
      await this.simulateWechatAuth()
      
      // 生成微信用户信息
      const userInfo = {
        id: 'wechat_' + Date.now(),
        userId: 'wechat_' + Date.now(),
        nickName: '微信用户',
        avatar: '/images/wechat-avatar.png',
        loginTime: new Date().toISOString(),
        loginType: 'wechat',
        isWechatUser: true
      }

      // 调用app的登录成功处理
      const loginSuccess = await app.onLoginSuccess(userInfo, 'wechat_token_' + Date.now())
      
      if (!loginSuccess) {
        throw new Error('登录处理失败')
      }

      wx.hideLoading()

      // 检查是否需要完善宝宝信息
      await this.checkBabyInfo()

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)

    } catch (error) {
      console.error('微信登录失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || '授权失败',
        icon: 'none'
      })
    }
  },

  /**
   * 模拟微信授权
   */
  async simulateWechatAuth() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 1500)
    })
  },

  /**
   * 检查是否需要完善宝宝信息
   */
  async checkBabyInfo() {
    const babyInfo = app.getCurrentBaby()
    const babies = app.getBabies()
    
    if (!babyInfo || babies.length === 0) {
      // 没有宝宝信息，跳转到添加宝宝页面
      setTimeout(() => {
        wx.showModal({
          title: '完善宝宝信息',
          content: '为了更好地为您服务，请添加宝宝信息',
          confirmText: '去添加',
          cancelText: '稍后再说',
          confirmColor: '#FF6B95',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/baby/add-baby'
              })
            }
          }
        })
      }, 2000)
    }
  },

  goToTerms: function() {
    wx.navigateTo({
      url: '/pages/settings/terms'
    })
  },

  goToPrivacy: function() {
    wx.navigateTo({
      url: '/pages/settings/privacy'
    })
  },

  showGuideModal: function() {
    this.setData({
      showGuideModal: true
    })
  },

  hideGuideModal: function() {
    this.setData({
      showGuideModal: false
    })
  },

  onShow: function() {
    // 页面显示时隐藏引导
    this.setData({
      showGuide: false
    })
  }
})