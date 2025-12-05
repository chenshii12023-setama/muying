Page({
  data: {
    babyId: null,
    baby: null,
    records: [],
    loading: true
  },

  onLoad(options) {
    const babyId = options.babyId
    if (babyId) {
      this.setData({ babyId })
      this.loadBabyInfo(babyId)
      this.loadRecords(babyId)
    }
  },

  loadBabyInfo(babyId) {
    try {
      const babies = wx.getStorageSync('babies') || []
      const baby = babies.find(b => b.id == babyId)
      
      if (baby) {
        this.setData({ baby })
        wx.setNavigationBarTitle({
          title: `${baby.name}的成长记录`
        })
      }
    } catch (error) {
      console.error('加载宝宝信息失败:', error)
    }
  },

  loadRecords(babyId) {
    try {
      const growthRecords = wx.getStorageSync('growthRecords') || []
      const babyRecords = growthRecords
        .filter(record => record.babyId == babyId)
        .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate))

      this.setData({
        records: babyRecords,
        loading: false
      })
    } catch (error) {
      console.error('加载成长记录失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  onShow() {
    // 页面显示时重新加载数据，以反映最新的编辑
    if (this.data.babyId) {
      this.loadRecords(this.data.babyId)
    }
  },

  // 跳转到编辑页面
  editRecord(e) {
    const recordId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/growth/edit?id=${recordId}`
    })
  },

  // 删除记录
  deleteRecord(e) {
    const recordId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条成长记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            const growthRecords = wx.getStorageSync('growthRecords') || []
            const filteredRecords = growthRecords.filter(item => item.id !== recordId)
            
            wx.setStorageSync('growthRecords', filteredRecords)
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            
            // 重新加载记录列表
            this.loadRecords(this.data.babyId)
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
  },

  // 添加新记录
  addRecord() {
    wx.navigateTo({
      url: `/pages/growth/add?babyId=${this.data.babyId}`
    })
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  }
})