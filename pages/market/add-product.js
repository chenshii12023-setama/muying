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
        wx.showLoading({
          title: '上传图片中...',
          mask: true
        })
        
        // 上传图片到Supabase存储
        const uploadedImages = []
        let uploadIndex = 0
        let hasUploadError = false
        let uploadErrorDetails = []
        
        function uploadNextImage() {
          if (uploadIndex >= res.tempFilePaths.length) {
            // 所有图片上传完成
            const newImages = that.data.imageList.concat(uploadedImages)
            
            that.setData({
              imageList: newImages
            })
            
            wx.hideLoading()
            
            if (hasUploadError) {
              // 显示详细的错误信息
              let errorMessage = '部分图片上传失败，已使用本地文件'
              if (uploadErrorDetails.length > 0) {
                const firstError = uploadErrorDetails[0]
                if (firstError.includes('存储桶')) {
                  errorMessage = '图片上传服务未配置，请联系管理员'
                } else if (firstError.includes('网络')) {
                  errorMessage = '网络连接失败，请检查网络设置'
                }
              }
              
              wx.showToast({
                title: errorMessage,
                icon: 'none',
                duration: 3000
              })
            } else {
              wx.showToast({
                title: '图片上传成功',
                icon: 'success'
              })
            }
            return
          }
          
          const tempPath = res.tempFilePaths[uploadIndex]
          
          SupabaseAPI.uploadFile(tempPath, 'market-images').then(function(uploadUrl) {
            uploadedImages.push(uploadUrl)
            uploadIndex++
            uploadNextImage()
          }).catch(function(error) {
            console.error('图片上传失败:', error)
            hasUploadError = true
            uploadErrorDetails.push(error.message)
            
            // 上传失败时，使用本地文件路径作为降级方案
            uploadedImages.push(tempPath)
            uploadIndex++
            uploadNextImage()
          })
        }
        
        uploadNextImage()
      },
      fail: function(error) {
        console.error('选择图片失败:', error)
        
        // 提供更具体的错误提示
        let errorMessage = '选择图片失败'
        if (error.errMsg && error.errMsg.includes('auth deny')) {
          errorMessage = '请允许小程序访问相册和相机权限'
        } else if (error.errMsg && error.errMsg.includes('cancel')) {
          return // 用户主动取消，不显示提示
        }
        
        wx.showToast({
          title: errorMessage,
          icon: 'none'
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
    // 验证商品标题
    if (!this.data.title.trim()) {
      wx.showToast({
        title: '请输入商品标题',
        icon: 'none'
      })
      return false
    }
    
    if (this.data.title.trim().length < 2) {
      wx.showToast({
        title: '商品标题至少2个字',
        icon: 'none'
      })
      return false
    }

    // 验证价格
    if (!this.data.price || this.data.price.trim() === '') {
      wx.showToast({
        title: '请输入转让价格',
        icon: 'none'
      })
      return false
    }
    
    const priceValue = parseFloat(this.data.price)
    if (isNaN(priceValue) || priceValue <= 0) {
      wx.showToast({
        title: '请输入正确的价格',
        icon: 'none'
      })
      return false
    }
    
    if (priceValue > 100000) {
      wx.showToast({
        title: '价格不能超过10万元',
        icon: 'none'
      })
      return false
    }

    // 验证原价（如果填写）
    if (this.data.originalPrice && this.data.originalPrice.trim() !== '') {
      const originalPriceValue = parseFloat(this.data.originalPrice)
      if (isNaN(originalPriceValue) || originalPriceValue <= 0) {
        wx.showToast({
          title: '请输入正确的原价',
          icon: 'none'
        })
        return false
      }
      
      if (originalPriceValue < priceValue) {
        wx.showToast({
          title: '原价不能低于转让价',
          icon: 'none'
        })
        return false
      }
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

    // 验证商品描述
    if (!this.data.description.trim()) {
      wx.showToast({
        title: '请输入商品描述',
        icon: 'none'
      })
      return false
    }
    
    if (this.data.description.trim().length < 10) {
      wx.showToast({
        title: '商品描述至少10个字',
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

    // 验证交易地点
    if (!this.data.location.trim()) {
      wx.showToast({
        title: '请输入交易地点',
        icon: 'none'
      })
      return false
    }
    
    if (this.data.location.trim().length < 2) {
      wx.showToast({
        title: '交易地点至少2个字',
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
    // 防重复提交检查
    if (this.data.isSubmitting) {
      console.log('正在提交中，请勿重复点击')
      return
    }
    
    if (!this.validateForm()) {
      return
    }

    this.setData({ isSubmitting: true })
    
    // 添加提交时间戳，用于防止快速重复提交
    this._lastSubmitTime = Date.now()

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
      
      // 检查用户ID格式，确保使用正确的用户ID
      let profileId = userProfile.id
      if (!profileId || !this.isValidUUID(profileId)) {
        // 如果没有有效的UUID，生成一个新的UUID
        profileId = this.generateUUID()
        // 更新本地存储的用户信息
        wx.setStorageSync('userProfile', {
          ...userProfile,
          id: profileId
        })
        console.log('生成新的用户UUID:', profileId)
      }

      // 生成新商品数据 - 预处理和验证所有字段
      const newProduct = this.prepareProductData()

      console.log('提交商品数据:', newProduct)
      console.log('用户ID:', profileId)

      // 添加调试信息
      wx.showLoading({
        title: '发布中...',
        mask: true
      })

      // 使用 SupabaseAPI 保存到数据库 - 使用正确的profileId
      console.log('准备调用API创建商品，用户ID:', profileId, '商品数据:', JSON.stringify(newProduct, null, 2))
      
      // 检查网络状态
      const networkType = await this.checkNetworkStatus()
      if (networkType === 'none') {
        throw new Error('网络连接不可用，请检查网络设置')
      }
      
      // 添加重试机制
      const createdProduct = await this.retryApiCall(
        () => SupabaseAPI.createSecondhandItem(profileId, newProduct),
        3, // 最多重试3次
        1000 // 重试间隔1秒
      )
      
      wx.hideLoading()

      console.log('商品发布成功:', createdProduct)
      
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500
      })

      // 返回上一页
      setTimeout(() => {
        try {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            // 返回上一页
            wx.navigateBack({
              delta: 1,
              success: function() {
                // 触发上一页刷新
                const prevPage = pages[pages.length - 2]
                if (prevPage && prevPage.route && prevPage.route.includes('market')) {
                  if (prevPage.loadProducts) {
                    prevPage.loadProducts() // 更新商品列表
                  }
                  if (prevPage.loadMyProducts) {
                    prevPage.loadMyProducts() // 更新我的发布
                  }
                }
              },
              fail: function() {
                // 如果返回失败，直接跳转到市场页面
                wx.redirectTo({
                  url: '/pages/market/market'
                })
              }
            })
          } else {
            // 如果没有上一页，直接跳转到市场页面
            wx.redirectTo({
              url: '/pages/market/market'
            })
          }
        } catch (error) {
          console.error('页面跳转失败:', error)
          // 兜底方案：直接跳转到市场页面
          wx.redirectTo({
            url: '/pages/market/market'
          })
        }
      }, 1500)

    } catch (error) {
      console.error('保存商品失败:', error)
      
      // 隐藏加载状态
      wx.hideLoading()
      
      // 根据错误类型提供更具体的错误提示
      let errorMessage = '发布失败，请重试'
      
      if (error.message.includes('numeric field overflow')) {
        errorMessage = '数据格式错误，请检查价格等数字字段'
      } else if (error.message.includes('缺少必要字段')) {
        errorMessage = error.message
      } else if (error.message.includes('网络请求失败')) {
        errorMessage = '网络连接失败，请检查网络设置'
      } else if (error.message.includes('数据库操作失败')) {
        errorMessage = '服务器错误，请稍后重试'
      }
      
      wx.showModal({
        title: '发布失败',
        content: errorMessage,
        showCancel: false,
        confirmText: '知道了'
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
   * 格式化价格数据以适应数据库字段类型
   */
  formatPriceForDatabase: function(price) {
    if (typeof price !== 'number' || isNaN(price)) {
      console.warn('价格格式错误，使用默认值0:', price)
      return 0.00
    }
    
    // 确保价格是数字类型，并保留2位小数
    const formattedPrice = parseFloat(price.toFixed(2))
    
    // 验证价格范围（避免超出数据库DECIMAL(10,2)的范围）
    if (formattedPrice < 0) {
      console.warn('价格不能为负数，使用0:', formattedPrice)
      return 0.00
    }
    
    if (formattedPrice > 99999999.99) {
      console.warn('价格超出数据库范围，使用最大值:', formattedPrice)
      return 99999999.99
    }
    
    return formattedPrice
  },

  /**
   * 预处理和验证商品数据
   */
  prepareProductData: function() {
    const data = {
      title: this.data.title.trim(),
      description: this.data.description.trim(),
      price: this.formatPriceForDatabase(parseFloat(this.data.price)),
      category: this.data.category,
      condition: this.data.condition,
      location: this.data.location.trim(),
      status: 'available'
    }
    
    // 处理可选字段
    if (this.data.originalPrice && this.data.originalPrice.trim()) {
      data.original_price = this.formatPriceForDatabase(parseFloat(this.data.originalPrice))
    }
    
    if (this.data.imageList && this.data.imageList.length > 0) {
      // 确保图片URL是有效的字符串
      data.images = this.data.imageList.map(img => {
        if (typeof img === 'string') {
          return img.trim()
        }
        return String(img)
      })
    }
    
    if (this.data.categoryName) {
      data.category_name = this.data.categoryName.trim()
    }
    
    if (this.data.usageTime) {
      data.usage_time = this.data.usageTime.trim()
    }
    
    if (this.data.hasCertification) {
      data.has_certification = Boolean(this.data.hasCertification)
    }
    
    // 添加时间戳
    const now = new Date().toISOString()
    data.created_at = now
    data.updated_at = now
    
    // 验证数据完整性
    this.validateProductData(data)
    
    console.log('预处理后的商品数据:', data)
    return data
  },

  /**
   * 验证商品数据完整性
   */
  validateProductData: function(data) {
    const requiredFields = ['title', 'description', 'price', 'category', 'condition', 'location']
    const missingFields = []
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        missingFields.push(field)
      }
    }
    
    if (missingFields.length > 0) {
      throw new Error(`缺少必要字段: ${missingFields.join(', ')}`)
    }
    
    // 验证价格
    if (data.price <= 0) {
      throw new Error('价格必须大于0')
    }
    
    // 验证图片数量
    if (!data.images || data.images.length === 0) {
      throw new Error('至少需要上传一张图片')
    }
    
    // 验证原价逻辑
    if (data.original_price && data.original_price < data.price) {
      throw new Error('原价不能低于转让价格')
    }
    
    console.log('商品数据验证通过')
  },

  /**
   * 检查网络状态
   */
  checkNetworkStatus: function() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          resolve(res.networkType)
        },
        fail: () => {
          resolve('unknown')
        }
      })
    })
  },

  /**
   * API调用重试机制
   */
  retryApiCall: async function(apiCall, maxRetries = 3, delay = 1000) {
    let lastError
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`API调用第${attempt}次尝试...`)
        return await apiCall()
      } catch (error) {
        lastError = error
        console.warn(`第${attempt}次API调用失败:`, error.message)
        
        if (attempt < maxRetries) {
          console.log(`等待${delay}ms后重试...`)
          await this.delay(delay)
        }
      }
    }
    
    throw lastError
  },

  /**
   * 延迟函数
   */
  delay: function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * 验证 UUID 格式
   */
  isValidUUID: function(uuid) {
    if (typeof uuid !== 'string') return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  },

  /**
   * 生成 UUID v4 格式
   */
  generateUUID: function() {
    // 生成符合 UUID v4 标准的字符串
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
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