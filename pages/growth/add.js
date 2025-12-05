const app = getApp()

Page({
  data: {
    babyId: null,
    babyName: '',
    recordDate: '',
    recordType: 'height', // height, weight, both
    height: '',
    weight: '',
    notes: '',
    isSaving: false,
    recordTypes: [
      { label: '只记录身高', value: 'height' },
      { label: '只记录体重', value: 'weight' },
      { label: '身高体重都记录', value: 'both' }
    ]
  },

  onLoad: function(options) {
    const babyId = options.babyId
    if (!babyId) {
      wx.showToast({
        title: '宝宝信息错误',
        icon: 'none'
      })
      wx.navigateBack()
      return
    }

    // 获取宝宝信息
    this.setData({ babyId })
    this.loadBabyInfo(babyId)
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0]
    this.setData({ recordDate: today })
  },

  /**
   * 加载宝宝信息
   */
  loadBabyInfo: function(babyId) {
    try {
      // 从本地存储获取宝宝信息
      const babies = wx.getStorageSync('babies') || []
      const baby = babies.find(b => b.id == babyId)
      
      if (baby) {
        this.setData({
          babyName: baby.name || '宝宝'
        })
      } else {
        this.setData({
          babyName: '宝宝'
        })
      }
    } catch (error) {
      console.error('加载宝宝信息失败:', error)
      this.setData({
        babyName: '宝宝'
      })
    }
  },

  /**
   * 选择记录类型
   */
  onRecordTypeChange: function(e) {
    this.setData({
      recordType: e.detail.value
    })
  },

  /**
   * 日期选择
   */
  onDateChange: function(e) {
    this.setData({
      recordDate: e.detail.value
    })
  },

  /**
   * 身高输入
   */
  onHeightInput: function(e) {
    this.setData({
      height: e.detail.value
    })
  },

  /**
   * 体重输入
   */
  onWeightInput: function(e) {
    this.setData({
      weight: e.detail.value
    })
  },

  /**
   * 备注输入
   */
  onNotesInput: function(e) {
    this.setData({
      notes: e.detail.value
    })
  },

  /**
   * 表单验证
   */
  validateForm: function() {
    const { recordType, height, weight, recordDate } = this.data

    if (!recordDate) {
      wx.showToast({
        title: '请选择记录日期',
        icon: 'none'
      })
      return false
    }

    if (recordType === 'height' && !height) {
      wx.showToast({
        title: '请输入身高',
        icon: 'none'
      })
      return false
    }

    if (recordType === 'weight' && !weight) {
      wx.showToast({
        title: '请输入体重',
        icon: 'none'
      })
      return false
    }

    if (recordType === 'both' && (!height || !weight)) {
      wx.showToast({
        title: '请输入身高和体重',
        icon: 'none'
      })
      return false
    }

    return true
  },

  /**
   * 保存记录
   */
  saveRecord: function() {
    if (!this.validateForm()) {
      return
    }

    this.setData({ isSaving: true })

    try {
      const record = {
        id: Date.now(),
        babyId: this.data.babyId,
        babyName: this.data.babyName,
        recordDate: this.data.recordDate,
        recordType: this.data.recordType,
        height: this.data.recordType === 'height' || this.data.recordType === 'both' ? parseFloat(this.data.height) : null,
        weight: this.data.recordType === 'weight' || this.data.recordType === 'both' ? parseFloat(this.data.weight) : null,
        notes: this.data.notes,
        createdAt: new Date().toISOString()
      }

      // 保存到本地存储
      let records = wx.getStorageSync('growthRecords') || []
      records.unshift(record)
      wx.setStorageSync('growthRecords', records)

      // 更新宝宝的最新指标
      this.updateBabyLatestMetrics(record)

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack({
          success: function() {
            // 触发上一页刷新
            const pages = getCurrentPages()
            const prevPage = pages[pages.length - 2]
            if (prevPage && prevPage.route === 'pages/baby/baby') {
              prevPage.loadBabyData()
            } else if (prevPage && prevPage.route === 'pages/profile/profile') {
              prevPage.refreshData()
            }
          }
        })
      }, 1500)

    } catch (error) {
      console.error('保存记录失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isSaving: false })
    }
  },

  /**
   * 更新宝宝最新指标
   */
  updateBabyLatestMetrics: function(record) {
    try {
      const babies = wx.getStorageSync('babies') || []
      const babyIndex = babies.findIndex(b => b.id == record.babyId)
      
      if (babyIndex !== -1) {
        if (record.height) {
          babies[babyIndex].currentHeight = record.height + ' cm'
        }
        if (record.weight) {
          babies[babyIndex].currentWeight = record.weight + ' kg'
        }
        
        wx.setStorageSync('babies', babies)
        
        // 更新全局数据
        const app = getApp()
        if (app.globalData && app.globalData.babies) {
          const globalBabyIndex = app.globalData.babies.findIndex(b => b.id == record.babyId)
          if (globalBabyIndex !== -1) {
            if (record.height) {
              app.globalData.babies[globalBabyIndex].currentHeight = record.height + ' cm'
            }
            if (record.weight) {
              app.globalData.babies[globalBabyIndex].currentWeight = record.weight + ' kg'
            }
          }
        }
      }
    } catch (error) {
      console.error('更新宝宝指标失败:', error)
    }
  },

  /**
   * 查看历史记录
   */
  viewHistory: function() {
    wx.navigateTo({
      url: `/pages/growth/list?babyId=${this.data.babyId}`
    })
  },

  /**
   * 返回
   */
  goBack: function() {
    wx.navigateBack()
  }
})