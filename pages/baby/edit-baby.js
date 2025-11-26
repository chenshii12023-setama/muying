const app = getApp()

Page({
  data: {
    babyId: null,
    babyData: {
      name: '',
      gender: 'male',
      birthDate: '',
      bloodType: 'A',
      birthHeight: '',
      birthWeight: '',
      headSize: '',
      avatarUrl: ''
    },
    isSaving: false,
    isDeleting: false,
    genderOptions: [{
        label: '男宝宝',
        value: 'male',
        icon: '👦'
      },
      {
        label: '女宝宝',
        value: 'female',
        icon: '👧'
      }
    ],
    bloodTypeOptions: [{
        label: 'A型',
        value: 'A'
      },
      {
        label: 'B型',
        value: 'B'
      },
      {
        label: 'O型',
        value: 'O'
      },
      {
        label: 'AB型',
        value: 'AB'
      }
    ]
  },

  onLoad: function(options) {
    const babyId = options.id
    if (!babyId) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      wx.navigateBack()
      return
    }

    this.setData({
      babyId: babyId
    })

    this.loadBabyData()
  },

  // 加载宝宝数据
  async loadBabyData() {
    try {
      const result = await wx.request({
        url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies?id=eq.${this.data.babyId}`,
        method: 'GET',
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })

      if (result.statusCode === 200 && result.data.length > 0) {
        const babyData = result.data[0]
        this.setData({
          babyData: {
            name: babyData.name || '',
            gender: babyData.gender || 'male',
            birthDate: babyData.birth_date || babyData.birthDate || '',
            bloodType: babyData.blood_type || babyData.bloodType || 'A',
            height: babyData.height || '',
            weight: babyData.weight || '',
            headSize: babyData.head_size || babyData.headSize || '',
            avatar: babyData.avatar_url || babyData.avatar || '', // 修正 avatar 字段取值
            avatarUrl: babyData.avatar_url || '' // 确保 avatarUrl 也有值
          }
        })
      } else {
        throw new Error('宝宝信息不存在')
      }
    } catch (error) {
      console.error('加载宝宝数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      wx.navigateBack()
    }
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
            'babyData.avatarUrl': tempFiles[0].tempFilePath, // 用于上传
            'babyData.avatar': tempFiles[0].tempFilePath // 用于显示
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
      const babyData = { ...this.data.babyData
      }

      // 上传头像 (如果 avatarUrl 是本地临时路径)
      if (babyData.avatarUrl && babyData.avatarUrl.startsWith('wxfile://') || babyData.avatarUrl.startsWith('http://tmp/')) {
        // 注意：这里假设 app.globalData.supabase 已经初始化并包含 uploadFile 方法
        // 如果没有，需要替换为具体的 wx.uploadFile 逻辑
        if (app.globalData.supabase && app.globalData.supabase.uploadFile) {
          const avatarUrl = await app.globalData.supabase.uploadFile(babyData.avatarUrl, 'avatars')
          babyData.avatarUrl = avatarUrl
        }
      }

      // 转换字段名以匹配数据库
      const updateData = {
        name: babyData.name,
        gender: babyData.gender,
        birth_date: babyData.birthDate,
        blood_type: babyData.bloodType,
        birth_height: babyData.birthHeight ? parseFloat(babyData.birthHeight) : null,
        birth_weight: babyData.birthWeight ? parseFloat(babyData.birthWeight) : null,
        avatar_url: babyData.avatarUrl,
        updated_at: new Date().toISOString()
      }

      // 清理空值
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key]
        }
      })

      console.log('🔄 更新宝宝信息...', updateData)

      const result = await wx.request({
        url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies?id=eq.${this.data.babyId}`,
        method: 'PATCH',
        data: updateData,
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      })

      if (result.statusCode === 204 || result.statusCode === 200) {
        console.log('✅ 宝宝信息更新成功')

        // 更新全局数据中的宝宝信息
        const updatedBaby = {
          id: this.data.babyId,
          name: babyData.name,
          gender: babyData.gender,
          birthDate: babyData.birthDate,
          bloodType: babyData.bloodType,
          height: babyData.height ? parseFloat(babyData.height) : undefined,
          weight: babyData.weight ? parseFloat(babyData.weight) : undefined,
          headSize: babyData.headSize ? parseFloat(babyData.headSize) : undefined,
          avatar: babyData.avatarUrl, // 使用上传后的URL
          avatarText: babyData.name.charAt(0) || '👶'
        }

        // 更新全局宝宝列表
        const babyIndex = app.globalData.babies.findIndex(b => b.id === this.data.babyId)
        if (babyIndex !== -1) {
          app.globalData.babies[babyIndex] = {
            ...app.globalData.babies[babyIndex],
            ...updatedBaby
          }

          // 如果更新的是当前宝宝，同时更新currentBaby和babyInfo
          if (app.globalData.currentBaby && app.globalData.currentBaby.id === this.data.babyId) {
            app.globalData.currentBaby = app.globalData.babies[babyIndex]
            app.globalData.babyInfo = app.globalData.babies[babyIndex]
            wx.setStorageSync('currentBaby', app.globalData.babies[babyIndex])
          }

          // 更新本地存储的宝宝列表
          wx.setStorageSync('babies', app.globalData.babies)
        }

        this.setData({
          isSaving: false
        })

        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })

        // 返回上一页并刷新
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error('更新失败: ' + JSON.stringify(result.data))
      }

    } catch (error) {
      console.error('更新宝宝信息失败:', error)
      this.setData({
        isSaving: false
      })

      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      })
    }
  },

  /**
   * 删除宝宝
   */
  deleteBaby() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个宝宝吗？此操作不可恢复！',
      confirmColor: '#FF6B95',
      success: async (res) => {
        if (res.confirm) {
          this.setData({
            isDeleting: true
          })

          try {
            // 使用 wx.request 进行删除，保持与 onLoad 一致的 headers
            const result = await wx.request({
              url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies?id=eq.${this.data.babyId}`,
              method: 'DELETE',
              header: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
                'Content-Type': 'application/json'
              }
            })

            // Supabase 删除成功通常返回 204 (No Content)
            if (result.statusCode === 204 || result.statusCode === 200) {

              // 更新全局数据
              const babyIndex = app.globalData.babies.findIndex(b => b.id === this.data.babyId)
              if (babyIndex !== -1) {
                app.globalData.babies.splice(babyIndex, 1)

                // 如果删除的是当前宝宝，需要重新设置当前宝宝
                if (app.globalData.currentBaby && app.globalData.currentBaby.id === this.data.babyId) {
                  if (app.globalData.babies.length > 0) {
                    // 如果还有其他宝宝，设置第一个为当前宝宝
                    app.globalData.currentBaby = app.globalData.babies[0]
                    app.globalData.babyInfo = app.globalData.babies[0]
                    wx.setStorageSync('currentBaby', app.globalData.babies[0])
                  } else {
                    // 如果没有宝宝了，清空当前宝宝
                    app.globalData.currentBaby = null
                    app.globalData.babyInfo = null
                    wx.removeStorageSync('currentBaby')
                  }
                }

                // 更新本地存储
                wx.setStorageSync('babies', app.globalData.babies)
              }

              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })

              // 返回上一页
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)

            } else {
              throw new Error('删除失败')
            }
          } catch (error) {
            console.error('删除宝宝失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          } finally {
            this.setData({
              isDeleting: false
            })
          }
        }
      }
    })
  },

  /**
   * 取消
   */
  cancel: function() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消编辑吗？已修改的信息将不会保存。',
      confirmColor: '#FF6B95',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  }
})