const app = getApp()
const SupabaseAPI = require('../../supabase_config.js')

Page({
  data: {
    // 表单数据
    title: '',
    price: '',
    originalPrice: '',
    category: '',
    categoryName: '',
    categoryIndex: 0,
    condition: '',
    conditionIndex: 0,
    usageTime: '',
    usageTimeIndex: 0,
    description: '',
    location: '',
    hasCertification: false,
    
    // 图片相关
    imageList: [],
    maxImages: 9,
    
    // 分类选项
    categoryOptions: [
      { label: '安全座椅', value: 'car-seat' },
      { label: '婴儿车', value: 'stroller' },
      { label: '婴儿床', value: 'crib' },
      { label: '玩具', value: 'toys' },
      { label: '衣物', value: 'clothes' },
      { label: '喂养用品', value: 'feeding' },
      { label: '洗护用品', value: 'bath' },
      { label: '其他', value: 'other' }
    ],
    
    // 成色选项
    conditionOptions: [
      { label: '全新', value: 'new' },
      { label: '95成新', value: '95new' },
      { label: '9成新', value: '9new' },
      { label: '8成新', value: '8new' },
      { label: '7成新及以下', value: '7new' }
    ],
    
    // 使用时间选项
    usageTimeOptions: [
      { label: '未使用', value: 'unused' },
      { label: '1-3个月', value: '1-3months' },
      { label: '3-6个月', value: '3-6months' },
      { label: '6个月-1年', value: '6months-1year' },
      { label: '1-2年', value: '1-2years' },
      { label: '2年以上', value: '2years+' }
    ],
    
    // 状态
    isSubmitting: false
  },

  onLoad: function() {
    // 获取用户位置
    this.getUserLocation()
  },

  /**
   * 获取用户位置
   */
  getUserLocation: function() {
    const that = this
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        // 这里应该调用地址解析API，暂时使用模拟数据
        that.setData({
          location: '当前位置'
        })
      },
      fail: function() {
        console.log('获取位置失败')
        that.setData({
          location: ''
        })
      }
    })
  },

  /**
   * 输入事件处理
   */
  onTitleInput: function(e) {
    this.setData({ title: e.detail.value })
  },

  onPriceInput: function(e) {
    this.setData({ price: e.detail.value })
  },

  onOriginalPriceInput: function(e) {
    this.setData({ originalPrice: e.detail.value })
  },

  onDescriptionInput: function(e) {
    this.setData({ description: e.detail.value })
  },

  onLocationInput: function(e) {
    this.setData({ location: e.detail.value })
  },

  /**
   * 选择分类
   */
  onCategorySelect: function(e) {
    const index = parseInt(e.detail.value)
    const selected = this.data.categoryOptions[index]
    this.setData({
      category: selected.value,
      categoryName: selected.label,
      categoryIndex: index
    })
  },

  /**
   * 选择成色
   */
  onConditionSelect: function(e) {
    const index = parseInt(e.detail.value)
    const selected = this.data.conditionOptions[index]
    this.setData({
      condition: selected.label,
      conditionIndex: index
    })
  },

  /**
   * 选择使用时间
   */
  onUsageTimeSelect: function(e) {
    const index = parseInt(e.detail.value)
    const selected = this.data.usageTimeOptions[index]
    this.setData({
      usageTime: selected.label,
      usageTimeIndex: index
    })
  },

  /**
   * 切换消毒证明
   */
  toggleCertification: function() {
    this.setData({
      hasCertification: !this.data.hasCertification
    })
  },

  /**
   * 选择图片
   */
  chooseImage: function() {
    const that = this
    const remainCount = this.data.maxImages - this.data.imageList.length
    
    if (remainCount <= 0) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      })
      return
    }

    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        const newImages = that.data.imageList.concat(res.tempFilePaths)
        that.setData({
          imageList: newImages
        })
      }
    })
  },

  /**
   * 预览图片
   */
  previewImage: function(e) {
    const current = e.currentTarget.dataset.current
    const urls = e.currentTarget.dataset.urls
    
    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  /**
   * 删除图片
   */
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index
    const imageList = this.data.imageList
    imageList.splice(index, 1)
    
    this.setData({
      imageList: imageList
    })
  },

  /**
   * 表单验证
   */
  validateForm: function() {
    if (!this.data.title.trim()) {
      wx.showToast({
        title: '请输入商品标题',
        icon: 'none'
      })
      return false
    }

    if (!this.data.price || parseFloat(this.data.price) <= 0) {
      wx.showToast({
        title: '请输入正确的价格',
        icon: 'none'
      })
      return false
    }

    if (!this.data.category) {
      wx.showToast({
        title: '请选择商品分类',
        icon: 'none'
      })
      return false
    }

    if (!this.data.condition) {
      wx.showToast({
        title: '请选择商品成色',
        icon: 'none'
      })
      return false
    }

    if (!this.data.usageTime) {
      wx.showToast({
        title: '请选择使用时间',
        icon: 'none'
      })
      return false
    }

    if (!this.data.description.trim()) {
      wx.showToast({
        title: '请输入商品描述',
        icon: 'none'
      })
      return false
    }

    if (this.data.imageList.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      })
      return false
    }

    if (!this.data.location.trim()) {
      wx.showToast({
        title: '请输入交易地点',
        icon: 'none'
      })
      return false
    }

    return true
  },

  /**
   * 提交表单
   */
  async submitProduct() {
    if (!this.validateForm()) {
      return
    }

    this.setData({ isSubmitting: true })

    try {
      // 获取用户信息
      const userProfile = wx.getStorageSync('userProfile') || {
        id: null, // 需要真实的 UUID
        name: '用户'
      }
      
      // 如果没有有效的用户ID，提示用户先登录
      if (!userProfile.id) {
        wx.showToast({
          title: '请先登录后再发布商品',
          icon: 'none'
        })
        this.setData({ isSubmitting: false })
        return
      }
      
      // 检查用户ID格式，如果不是标准UUID格式，使用固定的测试UUID
      let profileId = userProfile.id
      if (!profileId || typeof profileId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)) {
        // 使用固定的测试用户UUID（实际应用中应该通过登录获取）
        profileId = '123e4567-e89b-12d3-a456-426614174000'
        // 更新本地存储的用户信息
        wx.setStorageSync('userProfile', {
          ...userProfile,
          id: profileId
        })
      }

      // 生成新商品数据 - 使用最小字段集避免数据库错误
      const newProduct = {
        title: this.data.title,
        description: this.data.description,
        price: parseFloat(this.data.price),
        category: this.data.category,
        condition: this.data.condition,
        location: this.data.location,
        status: 'available'
      }
      
      // 添加可选字段
      if (this.data.originalPrice) {
        newProduct.original_price = parseFloat(this.data.originalPrice)
      }
      if (this.data.imageList && this.data.imageList.length > 0) {
        newProduct.images = this.data.imageList
      }
      if (this.data.categoryName) {
        newProduct.category_name = this.data.categoryName
      }
      if (this.data.usageTime) {
        newProduct.usage_time = this.data.usageTime
      }
      if (this.data.hasCertification) {
        newProduct.has_certification = this.data.hasCertification
      }

      console.log('提交商品数据:', newProduct)

      // 使用 SupabaseAPI 保存到数据库
      const createdProduct = await SupabaseAPI.createSecondhandItem(userProfile.id, newProduct)

      wx.showToast({
        title: '发布成功',
        icon: 'success'
      })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack({
          success: function() {
            // 触发上一页刷新
            const pages = getCurrentPages()
            const prevPage = pages[pages.length - 2]
            if (prevPage && prevPage.route === 'pages/market/market') {
              prevPage.loadProducts() // 更新商品列表
              prevPage.loadMyProducts() // 更新我的发布
            }
          }
        })
      }, 1500)

    } catch (error) {
      console.error('保存商品失败:', error)
      wx.showToast({
        title: '发布失败，请重试',
        icon: 'error'
      })
    } finally {
      this.setData({ isSubmitting: false })
    }
  },

  /**
   * 重置表单
   */
  resetForm: function() {
    wx.showModal({
      title: '确认重置',
      content: '确定要清空所有填写的信息吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            title: '',
            price: '',
            originalPrice: '',
            category: '',
            categoryName: '',
            condition: '',
            usageTime: '',
            description: '',
            location: '',
            hasCertification: false,
            imageList: []
          })
        }
      }
    })
  },

  /**
   * 生成 UUID
   */
  generateUUID: function() {
    // 生成符合 UUID v4 格式的字符串
    const timestamp = Date.now().toString(16)
    const randomPart = Math.random().toString(16).substr(2, 8)
    return `${timestamp.substr(0, 8)}-${timestamp.substr(8, 4)}-${timestamp.substr(12, 4)}-${randomPart}-${randomPart}${Math.random().toString(16).substr(2, 4)}`
  },

  /**
   * 查看发布指南
   */
  showGuidelines: function() {
    wx.showModal({
      title: '发布指南',
      content: '1. 请真实描述商品状况\n2. 上传清晰商品图片\n3. 合理定价提高成交率\n4. 填写详细商品描述\n5. 选择安全交易地点',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})