const app = getApp()

Page({
  data: {
    babyId: null,
    babyData: {
      name: '',
      gender: 'male',
      birthDate: '',
      bloodType: '',
      birthWeight: '',
      birthHeight: '',
      currentWeight: '',
      currentHeight: '',
      avatarUrl: ''
    },
    isSaving: false,
    isDeleting: false,
    bloodTypeOptions: ['A', 'B', 'AB', 'O', '未知'],
    bloodTypeIndex: null
  },

  onLoad(options) {
    const babyId = options.id
    if (!babyId) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      wx.navigateBack()
      return
    }
    this.setData({ babyId })
    this.loadBabyData()
  },

  // 封装 wx.request → Promise
  requestAsync(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: resolve,
        fail: reject
      })
    })
  },

  // 加载宝宝数据
  async loadBabyData() {
    try {
      const babyId = this.data.babyId

      // 先读本地缓存
      const localBabies = wx.getStorageSync('babies') || []
      const localBaby = localBabies.find(b => b.id === babyId)

      if (localBaby) {
        const bloodTypeIndex = this.data.bloodTypeOptions.indexOf(localBaby.blood_type || localBaby.bloodType)
        this.setData({
          babyData: {
            name: localBaby.name || '',
            gender: localBaby.gender || 'male',
            birthDate: localBaby.birth_date || '',
            bloodType: localBaby.blood_type || '',
            birthWeight: localBaby.birth_weight || '',
            birthHeight: localBaby.birth_height || '',
            currentWeight: localBaby.current_weight || '',
            currentHeight: localBaby.current_height || '',
            avatarUrl: localBaby.avatar_url || ''
          },
          bloodTypeIndex: bloodTypeIndex >= 0 ? bloodTypeIndex : null
        })
        return
      }

      // 网络加载
      const result = await this.requestAsync({
        url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies?id=eq.${babyId}`,
        method: 'GET',
        header: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o'
        }
      })

      if (result.statusCode === 200 && result.data.length > 0) {
        const baby = result.data[0]
        const bloodTypeIndex = this.data.bloodTypeOptions.indexOf(baby.blood_type)

        this.setData({
          babyData: {
            name: baby.name,
            gender: baby.gender,
            birthDate: baby.birth_date,
            bloodType: baby.blood_type === 'unknown' ? '未知' : baby.blood_type,
            birthWeight: baby.birth_weight || '',
            birthHeight: baby.birth_height || '',
            currentWeight: baby.current_weight || '',
            currentHeight: baby.current_height || '',
            avatarUrl: baby.avatar_url || ''
          },
          bloodTypeIndex: bloodTypeIndex >= 0 ? bloodTypeIndex : null
        })
      } else {
        throw new Error('宝宝不存在')
      }
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 2000)
    }
  },

  // 输入框通用修改
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`babyData.${field}`]: e.detail.value
    })
  },

  onDateChange(e) {
    this.setData({
      'babyData.birthDate': e.detail.value
    })
  },

  onGenderSelect(e) {
    this.setData({
      'babyData.gender': e.currentTarget.dataset.value
    })
  },

  onBloodTypeChange(e) {
    const index = Number(e.detail.value)
    this.setData({
      bloodTypeIndex: index,
      'babyData.bloodType': this.data.bloodTypeOptions[index]
    })
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: res => {
        if (res.tempFiles.length > 0) {
          this.setData({
            'babyData.avatarUrl': res.tempFiles[0].tempFilePath
          })
        }
      }
    })
  },

  // 表单验证
  validateForm() {
    const d = this.data.babyData

    if (!d.name.trim()) return wx.showToast({ title: '请输入名字', icon: 'none' }), false
    if (!d.birthDate) return wx.showToast({ title: '请选择出生日期', icon: 'none' }), false

    return true
  },

  // 保存信息
  async saveBaby() {
    if (!this.validateForm() || this.data.isSaving) return
    this.setData({ isSaving: true })

    try {
      const d = this.data.babyData

      const updateData = {
        name: d.name,
        gender: d.gender,
        birth_date: d.birthDate,
        blood_type: d.bloodType === '未知' ? 'unknown' : d.bloodType,
        birth_weight: d.birthWeight ? Number(d.birthWeight) : null,
        birth_height: d.birthHeight ? Number(d.birthHeight) : null,
        current_weight: d.currentWeight ? Number(d.currentWeight) : null,
        current_height: d.currentHeight ? Number(d.currentHeight) : null,
        avatar_url: d.avatarUrl,
        updated_at: new Date().toISOString()
      }

      const result = await this.requestAsync({
        url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies?id=eq.${this.data.babyId}`,
        method: 'PATCH',
        data: updateData,
        header: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        }
      })

      if (result.statusCode === 204) {
        wx.showToast({ title: '保存成功', icon: 'success' })
        
        // 更新本地缓存
        const localBabies = wx.getStorageSync('babies') || []
        const babyIndex = localBabies.findIndex(b => b.id === this.data.babyId)
        if (babyIndex !== -1) {
          localBabies[babyIndex] = { ...localBabies[babyIndex], ...updateData }
          wx.setStorageSync('babies', localBabies)
        }
        
        // 通知主页面刷新数据
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        if (prevPage && prevPage.route === 'pages/baby/baby') {
          prevPage.loadBabyData && prevPage.loadBabyData()
        }
        
        setTimeout(() => wx.navigateBack(), 1200)
      } else {
        throw new Error('更新失败')
      }
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' })
      console.error(err)
    } finally {
      this.setData({ isSaving: false })
    }
  },

  // 删除宝宝
  deleteBaby() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复',
      confirmColor: '#FF6B95',
      success: async res => {
        if (!res.confirm) return

        this.setData({ isDeleting: true })

        try {
          const result = await this.requestAsync({
            url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies?id=eq.${this.data.babyId}`,
            method: 'DELETE',
            header: {
              apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o'
            }
          })

          if (result.statusCode === 204) {
            wx.showToast({ title: '删除成功', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1200)
          } else {
            throw new Error('删除失败')
          }
        } catch (err) {
          wx.showToast({ title: '删除失败', icon: 'none' })
        } finally {
          this.setData({ isDeleting: false })
        }
      }
    })
  },

  cancel() {
    wx.navigateBack()
  }
})
