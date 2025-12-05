Page({
  data: {
    recordId: null,
    record: null,
    baby: null,
    typeOptions: ['身高', '体重', '头围', '体温', '睡眠', '饮食', '疫苗', '其他'],
    typeIndex: 0
  },

  onLoad(options) {
    const recordId = options.id
    if (recordId) {
      this.setData({ recordId })
      this.loadRecord(recordId)
    }
    this.loadBabyInfo()
  },

  loadRecord(recordId) {
    try {
      const growthRecords = wx.getStorageSync('growthRecords') || []
      const record = growthRecords.find(item => item.id === recordId)
      
      if (record) {
        const typeIndex = this.data.typeOptions.indexOf(record.type)
        this.setData({
          record,
          typeIndex: typeIndex >= 0 ? typeIndex : 0
        })
      } else {
        wx.showToast({
          title: '记录不存在',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载成长记录失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  loadBabyInfo() {
    try {
      const babyInfo = wx.getStorageSync('babyInfo') || {
        name: '宝宝',
        avatar: '/images/default-avatar.png'
      }
      this.setData({
        baby: babyInfo
      })
    } catch (error) {
      console.error('加载宝宝信息失败:', error)
    }
  },

  onTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },

  onTitleInput(e) {
    if (this.data.record) {
      this.setData({
        'record.title': e.detail.value
      })
    }
  },

  onValueInput(e) {
    if (this.data.record) {
      this.setData({
        'record.value': e.detail.value
      })
    }
  },

  onUnitInput(e) {
    if (this.data.record) {
      this.setData({
        'record.unit': e.detail.value
      })
    }
  },

  onNoteInput(e) {
    if (this.data.record) {
      this.setData({
        'record.note': e.detail.value
      })
    }
  },

  saveRecord() {
    if (!this.data.record) return

    const { title, value, note } = this.data.record
    
    if (!title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }

    if (!value.trim()) {
      wx.showToast({
        title: '请输入数值',
        icon: 'none'
      })
      return
    }

    try {
      const growthRecords = wx.getStorageSync('growthRecords') || []
      const recordIndex = growthRecords.findIndex(item => item.id === this.data.recordId)
      
      if (recordIndex !== -1) {
        // 更新记录
        growthRecords[recordIndex] = {
          ...this.data.record,
          title: title.trim(),
          value: value.trim(),
          note: note.trim(),
          type: this.data.typeOptions[this.data.typeIndex],
          updateTime: new Date().toISOString()
        }
        
        wx.setStorageSync('growthRecords', growthRecords)
        
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: '记录不存在',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存记录失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  deleteRecord() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条成长记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            const growthRecords = wx.getStorageSync('growthRecords') || []
            const filteredRecords = growthRecords.filter(item => item.id !== this.data.recordId)
            
            wx.setStorageSync('growthRecords', filteredRecords)
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          } catch (error) {
            console.error('删除记录失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})