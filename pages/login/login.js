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
    showGuideModal: false
  },

  onLoad: function(options) {
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    if (token) {
      // 已登录，直接跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
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

  handleLogin: function() {
    if (!this.data.canLogin || this.data.isLoggingIn) return

    this.setData({
      isLoggingIn: true
    })

    // 模拟登录过程
    setTimeout(() => {
      // 保存用户信息
      const userInfo = {
        phoneNumber: this.data.phoneNumber,
        nickName: `宝妈${this.data.phoneNumber.slice(-4)}`,
        avatar: '/images/default-avatar.png',
        loginTime: new Date().toISOString()
      }

      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('token', 'mock_token_' + Date.now())

      this.setData({
        isLoggingIn: false
      })

      // 跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      })

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }, 1500)
  },

  handleWechatLogin: function() {
    if (!this.data.agreedToTerms) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    // 模拟微信登录
    wx.showLoading({
      title: '授权中...'
    })

    setTimeout(() => {
      // 模拟获取微信用户信息
      const userInfo = {
        nickName: '微信用户',
        avatar: '/images/wechat-avatar.png',
        loginTime: new Date().toISOString(),
        isWechatUser: true
      }

      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('token', 'wechat_token_' + Date.now())

      wx.hideLoading()

      // 跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      })

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }, 2000)
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