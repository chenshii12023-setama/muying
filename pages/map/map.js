const app = getApp()
const wxMapApi = require('../../utils/wx_map_api.js')

Page({
  data: {
    activeTab: 'nearby',
    searchKeyword: '',
    activeFilter: 'all',
    activeFilterName: '全部设施',
    filterTags: [
      { label: '全部', value: 'all' },
      { label: '母婴室', value: 'nursing_room' },
      { label: '游乐场', value: 'playground' },
      { label: '医院', value: 'hospital' },
      { label: '购物中心', value: 'shopping' },
      { label: '餐厅', value: 'restaurant' }
    ],
    nearbyFacilities: [],
    myUploads: [],
    currentLocation: null,
    mapCenter: { latitude: 39.908823, longitude: 116.397470 }, // 默认北京中心
    mapScale: 13,
    mapMarkers: [],
    isLoading: false,
    showLocationModal: false,
    errorMessage: ''
  },

  onLoad: function(options) {
    this.loadMyUploads()
    
    this.getCurrentLocationAndLoadFacilities()
  },

  onShow: function() {
    this.loadMyUploads()
    // 如果没有当前位置，重新获取
    if (!this.data.currentLocation) {
      this.getCurrentLocationAndLoadFacilities()
    }
  },

  /**
   * 获取当前位置并加载附近设施
   */
  getCurrentLocationAndLoadFacilities: function() {
    this.setData({ isLoading: true })
    
    wxMapApi.getCurrentLocation()
      .then(location => {
        console.log('当前位置:', location)
        this.setData({ 
          currentLocation: location,
          mapCenter: { latitude: location.latitude, longitude: location.longitude },
          showLocationModal: false,
          errorMessage: ''
        })
        
        // 加载附近设施
        this.loadNearbyFacilities()
        
        // 显示当前位置信息
        this.showToast('定位成功', 'success')
      })
      .catch(error => {
        console.error('获取位置失败:', error)
        this.setData({ 
          showLocationModal: true,
          errorMessage: error.message,
          isLoading: false
        })
      })
  },

  onShow: function() {
    this.loadMyUploads()
  },

  loadNearbyFacilities: function() {
    if (!this.data.currentLocation) {
      this.setData({ nearbyFacilities: [] })
      return
    }

    this.setData({ isLoading: true })
    
    // 根据当前筛选类型搜索
    const facilityType = this.data.activeFilter === 'all' ? 'nursing_room' : this.data.activeFilter
    
    wxMapApi.searchMaternalFacilities(this.data.currentLocation, facilityType, 5000)
      .then(result => {
        console.log('搜索结果:', result)
        
        // 转换微信地图POI数据为应用格式
        const facilities = result.pois.map(poi => {
          return {
            id: poi.id,
            name: poi.name,
            type: poi.type || this.mapKeywordToType(facilityType),
            typeName: this.getTypeName(poi.type || facilityType),
            typeIcon: this.getTypeIcon(poi.type || facilityType),
            address: poi.address,
            distance: poi.distance || 0,
            rating: Math.random() * 2 + 3, // 模拟评分
            reviewCount: Math.floor(Math.random() * 200) + 10, // 模拟评价数
            tags: poi.tags || this.getFacilityTags(poi.type || facilityType),
            latitude: poi.latitude,
            longitude: poi.longitude,
            tel: poi.tel || '',
            businessArea: poi.business_area || '附近商圈'
          }
        })
        
        this.setData({
          nearbyFacilities: facilities,
          isLoading: false
        })
        
        // 更新地图标记
        this.updateMapMarkers(facilities)
        
        if (facilities.length === 0) {
          this.showToast('未找到附近设施', 'none')
        }
      })
      .catch(error => {
        console.error('搜索设施失败:', error)
        this.setData({ 
          isLoading: false,
          errorMessage: `搜索失败: ${error.message}`
        })
        
        // 降级到模拟数据
        console.warn('微信地图API调用失败，使用模拟数据')
        this.loadMockFacilities()
      })
  },

  /**
   * 加载模拟设施数据（后备方案）
   */
  loadMockFacilities: function() {
    // 根据当前筛选类型生成相应的模拟数据
    const mockData = this.generateMockDataByType(this.data.activeFilter)
    
    this.setData({
      nearbyFacilities: mockData,
      isLoading: false
    })
    
    // 更新地图标记
    this.updateMapMarkers(mockData)
  },

  /**
   * 根据类型生成模拟数据
   */
  generateMockDataByType: function(filterType) {
    const baseLocation = this.data.currentLocation || { latitude: 31.2304, longitude: 121.4737 }
    
    const mockTemplates = {
      nursing_room: [
        { name: '万达广场母婴室', address: '人民路188号万达广场3楼', rating: 4.5, tags: ['尿布台', '免费', '热水', '消毒柜'] },
        { name: '银泰百货母婴室', address: '解放路234号银泰百货4楼', rating: 4.3, tags: ['尿布台', '哺乳室', '温奶器'] },
        { name: '火车站母婴室', address: '火车站候车大厅二楼', rating: 4.0, tags: ['24小时', '免费', '安全舒适'] }
      ],
      playground: [
        { name: '儿童主题乐园', address: '中山北路456号', rating: 4.2, tags: ['室内', '安全监控', '亲子活动'] },
        { name: '亲子游乐中心', address: '文化路78号', rating: 4.6, tags: ['益智游戏', '安全设施', '专业指导'] },
        { name: '社区儿童乐园', address: '和平路123号', rating: 4.1, tags: ['免费', '户外', '多样设施'] }
      ],
      hospital: [
        { name: '儿童医院', address: '健康路789号', rating: 4.8, tags: ['儿科', '急诊', '接种'] },
        { name: '妇幼保健院', address: '光明路456号', rating: 4.7, tags: ['产科', '儿科', '体检'] },
        { name: '社区医院儿科', address: '建设路123号', rating: 4.2, tags: ['基础医疗', '儿童保健', '预防接种'] }
      ],
      shopping: [
        { name: '宜家家居', address: '徐汇区漕溪路126号', rating: 4.3, tags: ['母婴室', '儿童游乐区', '哺乳室'] },
        { name: '儿童服装店', address: '商业街88号', rating: 4.0, tags: ['童装', '玩具', '母婴用品'] },
        { name: '母婴用品专卖店', address: '生活广场2楼', rating: 4.4, tags: ['奶粉', '尿不湿', '婴儿车'] }
      ],
      restaurant: [
        { name: '亲子餐厅', address: '美食街12号', rating: 4.5, tags: ['儿童餐椅', '游乐区', '营养搭配'] },
        { name: '家庭餐厅', address: '公园路34号', rating: 4.2, tags: ['儿童套餐', '安全餐具', '安静环境'] }
      ]
    }

    let templates = mockTemplates[filterType] || mockTemplates.nursing_room
    
    // 如果是全部类型，混合所有模板
    if (filterType === 'all') {
      templates = Object.values(mockTemplates).flat()
    }

    // 转换为设施数据
    return templates.map((template, index) => {
      // 在基准位置周围生成位置
      const latOffset = (Math.random() - 0.5) * 0.02
      const lngOffset = (Math.random() - 0.5) * 0.02
      
      return {
        id: `mock_${filterType}_${index}`,
        name: template.name,
        type: filterType === 'all' ? Object.keys(mockTemplates)[index % Object.keys(mockTemplates).length] : filterType,
        typeName: this.getTypeName(filterType === 'all' ? Object.keys(mockTemplates)[index % Object.keys(mockTemplates).length] : filterType),
        typeIcon: this.getTypeIcon(filterType === 'all' ? Object.keys(mockTemplates)[index % Object.keys(mockTemplates).length] : filterType),
        address: template.address,
        distance: Math.round((Math.random() * 5 + 0.5) * 10) / 10,
        rating: template.rating,
        reviewCount: Math.floor(Math.random() * 200) + 10,
        tags: template.tags,
        latitude: baseLocation.latitude + latOffset,
        longitude: baseLocation.longitude + lngOffset,
        tel: '021-12345678',
        businessArea: '附近商圈'
      }
    })
  },

  /**
   * 获取类型名称
   */
  getTypeName: function(type) {
    const nameMap = {
      nursing_room: '母婴室',
      playground: '儿童游乐场',
      hospital: '医院',
      shopping: '购物中心',
      restaurant: '亲子餐厅'
    }
    return nameMap[type] || '其他设施'
  },

  /**
   * 获取类型图标
   */
  getTypeIcon: function(type) {
    const iconMap = {
      nursing_room: '🚼',
      playground: '🎪',
      hospital: '🏥',
      shopping: '🏬',
      restaurant: '🍽️'
    }
    return iconMap[type] || '📍'
  },

  /**
   * 将高德POI类型映射到应用类型
   */
  mapPoiTypeToAppType: function(poiType) {
    const typeMap = {
      '母婴服务': 'nursing_room',
      '游乐园': 'playground',
      '医院': 'hospital',
      '购物': 'shopping',
      '餐饮': 'restaurant'
    }
    
    for (const [key, value] of Object.entries(typeMap)) {
      if (poiType && poiType.includes(key)) {
        return value
      }
    }
    
    return 'nursing_room' // 默认类型
  },

  /**
   * 获取POI类型名称
   */
  getPoiTypeName: function(poi) {
    const nameMap = {
      'nursing_room': '母婴室',
      'playground': '儿童游乐场',
      'hospital': '医院',
      'shopping': '购物中心',
      'restaurant': '亲子餐厅'
    }
    
    return nameMap[this.mapPoiTypeToAppType(poi.type)] || '其他设施'
  },

  /**
   * 获取POI类型图标
   */
  getPoiTypeIcon: function(poiType) {
    const iconMap = {
      'nursing_room': '🚼',
      'playground': '🎪',
      'hospital': '🏥',
      'shopping': '🏬',
      'restaurant': '🍽️'
    }
    
    return iconMap[this.mapPoiTypeToAppType(poiType)] || '📍'
  },

  /**
   * 提取POI标签
   */
  extractPoiTags: function(poi) {
    const tags = []
    
    if (poi.tag && typeof poi.tag === 'string') {
      const poiTags = poi.tag.split(';')
      poiTags.forEach(tag => {
        if (tag && tag.trim()) {
          tags.push(tag.trim())
        }
      })
    }
    
    // 添加一些通用标签
    if (poi.type && poi.type.includes('母婴')) {
      tags.push('母婴设施')
    }
    
    return tags.slice(0, 4) // 最多显示4个标签
  },

  /**
   * 计算距离
   */
  calculateDistance: function(location) {
    if (!this.data.currentLocation || !location) {
      return Math.random() * 5 + 0.5 // 模拟距离
    }
    
    const [lng, lat] = location.split(',').map(Number)
    const currentLat = this.data.currentLocation.latitude
    const currentLng = this.data.currentLocation.longitude
    
    // 简单的距离计算（实际应该使用更精确的公式）
    const distance = Math.sqrt(
      Math.pow(lat - currentLat, 2) + Math.pow(lng - currentLng, 2)
    ) * 111 // 大约转换为公里
    
    return Math.round(distance * 10) / 10
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
    
    // 更新筛选器名称
    this.updateFilterName()
    
    if (filter === 'all') {
      this.loadNearbyFacilities()
    } else {
      const filtered = this.data.nearbyFacilities.filter(facility => 
        facility.type === filter
      )
      
      this.setData({
        nearbyFacilities: filtered
      })
      
      // 更新地图标记
      this.updateMapMarkers(filtered)
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
  },

  /**
   * 重新定位
   */
  reLocate: function() {
    this.getCurrentLocationAndLoadFacilities()
  },

  /**
   * 打开地图导航 - 直接调用高德地图
   */
  navigateToLocation: function(e) {
    const facility = e.currentTarget.dataset.facility
    this.navigateToAmap(facility)
  },

  /**
   * 规划步行路线
   */
  planWalkingRoute: function(e) {
    const facility = e.currentTarget.dataset.facility
    
    if (!this.data.currentLocation) {
      this.showToast('请先获取当前位置', 'warning')
      return
    }
    
    this.setData({ isLoading: true })
    
    const destination = {
      longitude: facility.longitude,
      latitude: facility.latitude
    }
    
    wxMapApi.planWalkingRoute(this.data.currentLocation, destination)
      .then(result => {
        console.log('路径规划结果:', result)
        
        if (result.routes && result.routes.length > 0) {
          const route = result.routes[0]
          const distance = route.distance
          const duration = route.duration
          
          wx.showModal({
            title: '步行路线',
            content: `距离: ${(distance/1000).toFixed(1)}公里\n预计用时: ${Math.ceil(duration/60)}分钟`,
            confirmText: '开始导航',
            success: (res) => {
              if (res.confirm) {
                this.navigateToLocation({ currentTarget: { dataset: { facility } } })
              }
            }
          })
        } else {
          this.showToast('未找到可行走路线', 'none')
        }
        
        this.setData({ isLoading: false })
      })
      .catch(error => {
        console.error('路径规划失败:', error)
        this.setData({ isLoading: false })
        this.showToast('路径规划失败', 'error')
      })
  },

  /**
   * 刷新设施列表
   */
  refreshFacilities: function() {
    this.loadNearbyFacilities()
  },

  /**
   * 显示Toast提示
   */
  showToast: function(message, type = 'none') {
    wx.showToast({
      title: message,
      icon: type,
      duration: 2000
    })
  },

  /**
   * 更新地图标记
   */
  updateMapMarkers: function(facilities) {
    if (!this.data.currentLocation) return

    const markers = []
    
    // 添加当前位置标记 - 使用系统默认样式
    markers.push({
      id: 0,
      latitude: this.data.currentLocation.latitude,
      longitude: this.data.currentLocation.longitude,
      width: 30,
      height: 30,
      callout: {
        content: '我的位置',
        color: '#333',
        fontSize: 12,
        borderRadius: 4,
        bgColor: '#52c41a',
        color: '#fff',
        padding: 5
      }
    })

    // 添加设施标记 - 使用emoji作为临时标记
    const emojiMap = {
      'nursing_room': '🚼',
      'playground': '🎪', 
      'hospital': '🏥',
      'shopping': '🏬',
      'restaurant': '🍽️'
    }

    facilities.forEach((facility, index) => {
      const markerIcon = emojiMap[facility.type] || '📍'
      
      markers.push({
        id: facility.id || index + 1,
        latitude: facility.latitude,
        longitude: facility.longitude,
        width: 32,
        height: 32,
        callout: {
          content: `${markerIcon} ${facility.name} (${facility.distance}km)`,
          color: '#333',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#fff',
          padding: 5,
          display: 'BYCLICK'
        }
      })
    })

    this.setData({ mapMarkers: markers })
  },

  /**
   * 地图标记点击事件
   */
  onMarkerTap: function(e) {
    const markerId = e.detail.markerId
    if (markerId === 0) {
      // 点击了当前位置标记
      this.showToast('我的位置', 'none')
      return
    }

    // 找到对应的设施
    const facility = this.data.nearbyFacilities.find(f => 
      f.id === markerId || f.id === markerId.toString()
    )

    if (facility) {
      this.showFacilityOptions(facility)
    }
  },

  /**
   * 显示设施操作选项
   */
  showFacilityOptions: function(facility) {
    const that = this
    wx.showModal({
      title: facility.name,
      content: `地址：${facility.address}\n距离：${facility.distance}km`,
      confirmText: '导航',
      cancelText: '详情',
      success: function(res) {
        if (res.confirm) {
          that.navigateToAmap(facility)
        } else if (res.cancel) {
          that.navigateToFacility({ currentTarget: { dataset: { id: facility.id } } })
        }
      }
    })
  },

  /**
   * 跳转到高德地图导航
   */
  navigateToAmap: function(facility) {
    if (!facility || !facility.latitude || !facility.longitude) {
      this.showToast('位置信息不完整', 'error')
      return
    }

    const destination = `${facility.latitude},${facility.longitude}`
    const name = encodeURIComponent(facility.name)
    const address = encodeURIComponent(facility.address)

    // 高德地图导航URL
    const amapUrl = `androidamap://route/plan/?slat=${this.data.currentLocation.latitude}&slon=${this.data.currentLocation.longitude}&sname=我的位置&dlat=${facility.latitude}&dlon=${facility.longitude}&dname=${name}&dev=0&t=0`

    // 备用网页版高德地图
    const webUrl = `https://uri.amap.com/navigation?to=${destination},${name},${address}&mode=car&coordinate=gaode&src=mypage`

    wx.showModal({
      title: '选择导航方式',
      content: '是否使用高德地图进行导航？',
      confirmText: '打开高德地图',
      cancelText: '网页导航',
      success: function(res) {
        if (res.confirm) {
          // 尝试打开高德地图APP
          wx.openLocation({
            latitude: facility.latitude,
            longitude: facility.longitude,
            name: facility.name,
            address: facility.address,
            scale: 18,
            success: () => {
              console.log('打开微信地图成功')
            },
            fail: () => {
              // 如果微信地图也失败，使用网页导航
              wx.showModal({
                title: '提示',
                content: '无法打开地图应用，是否使用网页导航？',
                confirmText: '确定',
                success: (webRes) => {
                  if (webRes.confirm) {
                    that.copyToClipboard(webUrl, '导航链接已复制，请在浏览器中打开')
                  }
                }
              })
            }
          })
        } else if (res.cancel) {
          // 复制网页版导航链接
          that.copyToClipboard(webUrl, '导航链接已复制，请在浏览器中打开')
        }
      }
    })
  },

  /**
   * 复制到剪贴板
   */
  copyToClipboard: function(text, message) {
    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({
          title: message || '已复制到剪贴板',
          icon: 'none'
        })
      },
      fail: function() {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 地图区域变化事件
   */
  onMapRegionChange: function(e) {
    if (e.type === 'end') {
      // 地图移动结束后，可以重新搜索该区域的设施
      console.log('地图区域变化:', e.detail)
    }
  },

  /**
   * 地图放大
   */
  zoomIn: function() {
    const newScale = Math.min(this.data.mapScale + 2, 20)
    this.setData({ mapScale: newScale })
  },

  /**
   * 地图缩小
   */
  zoomOut: function() {
    const newScale = Math.max(this.data.mapScale - 2, 3)
    this.setData({ mapScale: newScale })
  },

  /**
   * 更新筛选器名称
   */
  updateFilterName: function() {
    const filterItem = this.data.filterTags.find(tag => tag.value === this.data.activeFilter)
    const filterName = filterItem ? filterItem.label : '全部设施'
    this.setData({ activeFilterName: filterName })
  },

  /**
   * 处理错误
   */
  handleError: function(error, context = '') {
    console.error(`${context}错误:`, error)
    this.showToast(error.message || '操作失败', 'error')
  }
})