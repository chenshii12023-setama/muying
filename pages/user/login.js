const fixUserProfile = require('../../fix_user_profile.js')

Page({
  data: {
    userAvatar: '/images/default-avatar.png',
    userName: '用户',
    isLoggedIn: false
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const userProfile = wx.getStorageSync('userProfile')
    
    if (userProfile && userProfile.id) {
      this.setData({
        userAvatar: userProfile.avatar || '/images/default-avatar.png',
        userName: userProfile.nickname || userProfile.name || '用户',
        isLoggedIn: true
      })
    } else {
      this.setData({
        isLoggedIn: false
      })
    }
  },

  // 登录/注册
  login() {
    // 修复用户配置并设置正确的UUID
    const userProfile = fixUserProfile.fixUserProfile()
    
    if (userProfile) {
      this.setData({
        userAvatar: userProfile.avatar,
        userName: userProfile.name,
        isLoggedIn: true
      })
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 登出
  logout() {
    wx.showModal({
      title: '确认登出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userProfile')
          this.setData({
            userAvatar: '/images/default-avatar.png',
            userName: '用户',
            isLoggedIn: false
          })
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 编辑用户资料
  editProfile() {
    wx.navigateTo({
      url: '/pages/user/edit-profile'
    })
  }
})