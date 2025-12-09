const app = getApp()
const SupabaseAPI = require('../../supabase_config.js')

Page({
  data: {
    productId: '',
    product: {
      title: '',
      category: '',
      condition: 'new',
      price: '',
      originalPrice: '',
      description: '',
      usageDuration: '',
      images: [],
      location: '',
      latitude: null,
      longitude: null
    },
    categories: [
      { label: '安全座椅', value: 'car-seat' },
      { label: '婴儿车', value: 'stroller' },
      { label: '婴儿床', value: 'crib' },
      { label: '玩具', value: 'toys' },
      { label: '衣物', value: 'clothes' },
      { label: '喂养用品', value: 'feeding' },
      { label: '洗护用品', value: 'bath' },
      { label: '其他', value: 'other' }
    ],
    conditions: [
      { label: '全新', value: 'new' },
      { label: '九成新', value: 'like-new' },
      { label: '八成新', value: 'good' },
      { label: '七成新', value: 'fair' },
      { label: '六成新', value: 'poor' }
    ],
    isSubmitting: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        productId: options.id
      })
      this.loadProductData(options.id)
    }
  },

  async loadProductData(productId) {
    try {
      const product = await SupabaseAPI.getSecondhandItemById(productId)
      if (product) {
        this.setData({
          product: {
            ...product,
            images: product.images || [],
            location: product.location || ''
          }
        })
      } else {
        wx.showToast({
          title: '商品不存在',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载商品数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  onTitleInput(e) {
    this.setData({
      'product.title': e.detail.value
    })
  },

  onCategoryChange(e) {
    this.setData({
      'product.category': e.detail.value
    })
  },

  onConditionChange(e) {
    this.setData({
      'product.condition': e.detail.value
    })
  },

  onPriceInput(e) {
    this.setData({
      'product.price': e.detail.value
    })
  },

  onOriginalPriceInput(e) {
    this.setData({
      'product.originalPrice': e.detail.value
    })
  },

  onDescriptionInput(e) {
    this.setData({
      'product.description': e.detail.value
    })
  },

  onUsageDurationInput(e) {
    this.setData({
      'product.usageDuration': e.detail.value
    })
  },

  onLocationInput(e) {
    this.setData({
      'product.location': e.detail.value
    })
  },

  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.product.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const images = this.data.product.images.concat(res.tempFilePaths)
        this.setData({
          'product.images': images
        })
      }
    })
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.product.images
    images.splice(index, 1)
    this.setData({
      'product.images': images
    })
  },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'product.location': res.address,
          'product.latitude': res.latitude,
          'product.longitude': res.longitude
        })
      },
      fail: (err) => {
        console.error('选择位置失败:', err)
      }
    })
  },

  async submitForm() {
    const { product, productId } = this.data
    
    // 表单验证
    if (!product.title.trim()) {
      wx.showToast({
        title: '请输入商品标题',
        icon: 'none'
      })
      return
    }

    if (!product.category) {
      wx.showToast({
        title: '请选择商品分类',
        icon: 'none'
      })
      return
    }

    if (!product.price || parseFloat(product.price) <= 0) {
      wx.showToast({
        title: '请输入合理的价格',
        icon: 'none'
      })
      return
    }

    if (product.images.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      })
      return
    }

    this.setData({
      isSubmitting: true
    })

    try {
      // 获取用户信息
      const userProfile = wx.getStorageSync('userProfile')
      if (!userProfile || !userProfile.id) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        this.setData({ isSubmitting: false })
        return
      }

      // 更新商品数据
      await SupabaseAPI.updateSecondhandItem(productId, {
        title: product.title.trim(),
        category: product.category,
        condition: product.condition,
        price: parseFloat(product.price),
        original_price: product.originalPrice ? parseFloat(product.originalPrice) : null,
        description: product.description.trim(),
        usage_duration: product.usageDuration,
        images: product.images,
        location: product.location,
        latitude: product.latitude,
        longitude: product.longitude,
        updated_at: new Date().toISOString()
      })

      wx.showToast({
        title: '更新成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('更新商品失败:', error)
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      })
    } finally {
      this.setData({
        isSubmitting: false
      })
    }
  },

  deleteProduct() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？删除后无法恢复',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            await SupabaseAPI.deleteSecondhandItem(this.data.productId)
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          } catch (error) {
            console.error('删除商品失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          }
        }
      }
    })
  }
})