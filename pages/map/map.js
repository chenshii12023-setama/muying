const app = getApp()

Page({
  data: {
    activeTab: 'nearby',
    searchKeyword: '',
    activeFilter: 'all',
    filterTags: [
      { label: '全部', value: 'all' },
      { label: '母婴室', value: 'nursing' },
      { label: '游乐场', value: 'playground' },
      { label: '医院', value: 'hospital' },
      { label: '购物中心', value: 'mall' },
      { label: '餐厅', value: 'restaurant' }
    ],
    nearbyFacilities: [],
    myUploads: []
  },

  onLoad: function(options) {
    this.loadNearbyFacilities()
    this.loadMyUploads()
  },

  onShow: function() {
    this.loadMyUploads()
  },

  loadNearbyFacilities: function() {
    // 模拟附近设施数据
    const facilities = [
      {
        id: 1,
        name: '万达广场母婴室',
        type: 'nursing',
        typeName: '母婴室',
        typeIcon: '🚼',
        address: '人民路188号万达广场3楼',
        distance: 1.2,
        rating: 4.5,
        reviewCount: 128,
        tags: ['尿布台', '免费', '热水', '消毒柜'],
        latitude: 31.2304,
        longitude: 121.4737
      },
      {
        id: 2,
        name: '儿童主题乐园',
        type: 'playground',
        typeName: '儿童游乐场',
        typeIcon: '🎪',
        address: '中山北路456号',
        distance: 0.8,
        rating: 4.2,
        reviewCount: 89,
        tags: ['室内', '安全监控', '亲子活动'],
        latitude: 31.2312,
        longitude: 121.4745
      },
      {
        id: 3,
        name: '儿童医院',
        type: 'hospital',
        typeName: '儿童医院',
        typeIcon: '🏥',
        address: '健康路789号',
        distance: 2.1,
        rating: 4.8,
        reviewCount: 256,
        tags: ['儿科', '急诊', '接种'],
        latitude: 31.2298,
        longitude: 121.4723
      },
      {
        id: 4,
        name: '宜家家居',
        type: 'mall',
        typeName: '购物中心',
        typeIcon: '🏬',
        address: '徐汇区漕溪路126号',
        distance: 3.5,
        rating: 4.3,
        reviewCount: 167,
        tags: ['母婴室', '儿童游乐区', '哺乳室'],
        latitude: 31.2321,
        longitude: 121.4752
      }
    ]
    
    this.setData({
      nearbyFacilities: facilities
    })
  },

  loadMyUploads: function() {
    // 模拟我的上传数据
    const uploads = [
      {
        id: 1,
        name: '星巴克咖啡母婴角',
        address: '南京西路123号',
        uploadTime: '2024-01-15 14:30',
        status: 'approved',
        statusText: '已审核通过'
      },
      {
        id: 2,
        name: '社区公园儿童设施',
        address: '长宁路456号',
        uploadTime: '2024-01-20 10:15',
        status: 'pending',
        statusText: '审核中'
      }
    ]
    
    this.setData({
      myUploads: uploads
    })
  },

  onTabChange: function(e) {
    this.setData({
      activeTab: e.detail.value
    })
  },

  onSearchChange: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    
    // 实际项目中这里应该调用搜索API
    this.searchFacilities(e.detail.value)
  },

  searchFacilities: function(keyword) {
    // 模拟搜索功能
    if (!keyword) {
      this.loadNearbyFacilities()
      return
    }
    
    const filtered = this.data.nearbyFacilities.filter(facility => 
      facility.name.includes(keyword) || 
      facility.address.includes(keyword) ||
      facility.typeName.includes(keyword)
    )
    
    this.setData({
      nearbyFacilities: filtered
    })
  },

  onFilterTagTap: function(e) {
    const filter = e.currentTarget.dataset.value
    this.setData({
      activeFilter: filter
    })
    
    if (filter === 'all') {
      this.loadNearbyFacilities()
    } else {
      const filtered = this.data.nearbyFacilities.filter(facility => 
        facility.type === filter
      )
      
      this.setData({
        nearbyFacilities: filtered
      })
    }
  },

  showFilter: function() {
    wx.showActionSheet({
      itemList: ['按距离排序', '按评分排序', '按评价数排序'],
      success: (res) => {
        const index = res.tapIndex
        this.sortFacilities(index)
      }
    })
  },

  sortFacilities: function(sortType) {
    let sorted = [...this.data.nearbyFacilities]
    
    switch (sortType) {
      case 0: // 距离排序
        sorted.sort((a, b) => a.distance - b.distance)
        break
      case 1: // 评分排序
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 2: // 评价数排序
        sorted.sort((a, b) => b.reviewCount - a.reviewCount)
        break
    }
    
    this.setData({
      nearbyFacilities: sorted
    })
  },

  navigateToFacility: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/map/facility-detail?id=${id}`
    })
  },

  addNewFacility: function() {
    wx.navigateTo({
      url: '/pages/map/add-facility'
    })
  },

  editUpload: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/map/edit-facility?id=${id}`
    })
  },

  deleteUpload: function(e) {
    const id = e.currentTarget.dataset.id
    const that = this
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个设施信息吗？',
      success: function(res) {
        if (res.confirm) {
          const uploads = that.data.myUploads.filter(item => item.id !== id)
          that.setData({
            myUploads: uploads
          })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }
})