const app = getApp()

Page({
  data: {
    babyData: {
      name: '',
      gender: 'male',
      birthDate: '',
      bloodType: 'A',
      height: '',
      weight: '',
      headSize: '',
      avatar: ''
    },
    isSaving: false,
    genderOptions: [
      { label: '男宝宝', value: 'male', icon: '👦' },
      { label: '女宝宝', value: 'female', icon: '👧' }
    ],
    bloodTypeOptions: [
      { label: 'A型', value: 'A' },
      { label: 'B型', value: 'B' },
      { label: 'O型', value: 'O' },
      { label: 'AB型', value: 'AB' }
    ],

  },

  onLoad: function() {
    // 设置默认出生日期为今天
    const today = new Date()
    const birthDate = today.toISOString().split('T')[0]
    
    this.setData({
      'babyData.birthDate': birthDate,
      today: birthDate
    })
  },

  /**
   * 日期变化
   */
  onDateChange: function(e) {
    this.setData({
      'babyData.birthDate': e.detail.value
    })
  },

  /**
   * 输入框变化
   */
  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`babyData.${field}`]: value
    })
  },

  /**
   * 选择性别
   */
  onGenderChange: function(e) {
    this.setData({
      'babyData.gender': e.detail.value
    })
  },

  /**
   * 选择血型
   */
  onBloodTypeChange: function(e) {
    this.setData({
      'babyData.bloodType': e.detail.value
    })
  },



  /**
   * 选择头像
   */
  chooseAvatar: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles
        if (tempFiles.length > 0) {
          this.setData({
            'babyData.avatar': tempFiles[0].tempFilePath
          })
        }
      },
      fail: (error) => {
        console.error('选择图片失败:', error)
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 验证表单
   */
  validateForm: function() {
    const babyData = this.data.babyData
    
    if (!babyData.name.trim()) {
      wx.showToast({
        title: '请输入宝宝姓名',
        icon: 'none'
      })
      return false
    }
    
    if (!babyData.birthDate) {
      wx.showToast({
        title: '请选择出生日期',
        icon: 'none'
      })
      return false
    }
    
    if (babyData.weight && (parseFloat(babyData.weight) <= 0 || parseFloat(babyData.weight) > 100)) {
      wx.showToast({
        title: '请输入正确的体重',
        icon: 'none'
      })
      return false
    }
    
    if (babyData.height && (parseFloat(babyData.height) <= 0 || parseFloat(babyData.height) > 200)) {
      wx.showToast({
        title: '请输入正确的身高',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  /**
   * 保存宝宝信息
   */
  async saveBaby() {
    if (!this.validateForm() || this.data.isSaving) return

    this.setData({
      isSaving: true
    })

    try {
      // 检查用户是否已登录
      if (!app.globalData.userProfile) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        this.setData({
          isSaving: false
        })
        return
      }

      const babyData = { ...this.data.babyData }
      
      // 上传头像
      if (babyData.avatar && babyData.avatar.startsWith('wxfile://')) {
        const avatarUrl = await app.globalData.supabase.uploadFile(babyData.avatar, 'avatars')
        babyData.avatar = avatarUrl
      }
      
      // 清理空值
      Object.keys(babyData).forEach(key => {
        if (!babyData[key]) {
          delete babyData[key]
        }
      })
      
      // 直接保存到数据库
      console.log('👶 开始添加宝宝...')
      const profileId = app.globalData.userProfile.id || app.globalData.userProfile.user_id
      
      if (!profileId) {
        wx.showToast({
          title: '用户信息错误',
          icon: 'none'
        })
        this.setData({
          isSaving: false
        })
        return
      }
      
      const babyResult = await wx.request({
        url: 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies',
        method: 'POST',
        data: {
          ...babyData,
          profile_id: profileId,
          created_at: new Date().toISOString()
        },
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (babyResult.statusCode === 201) {
        console.log('✅ 宝宝添加成功:', babyResult.data[0])
        
        // 更新app的宝宝列表
        app.globalData.babies.unshift(babyResult.data[0])
        if (app.globalData.babies.length === 1) {
          app.globalData.currentBaby = babyResult.data[0]
          app.globalData.babyInfo = babyResult.data[0]
          wx.setStorageSync('currentBaby', babyResult.data[0])
        }
        
        this.setData({
          isSaving: false
        })

        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })

        // 返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error('添加失败: ' + JSON.stringify(babyResult.data))
      }

    } catch (error) {
      console.error('添加宝宝失败:', error)
      this.setData({
        isSaving: false
      })
      
      wx.showToast({
        title: error.message || '添加失败',
        icon: 'none'
      })
    }
  },

  /**
   * 取消
   */
  cancel: function() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消添加宝宝吗？已填写的信息将不会保存。',
      confirmColor: '#FF6B95',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  }
})