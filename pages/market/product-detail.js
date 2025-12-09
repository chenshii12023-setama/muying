const app = getApp()
const SupabaseAPI = require('../../supabase_config.js')

Page({
  data: {
    productId: null,
    product: null,
    isLoading: true,
    isLiked: false,
    canContact: true,
    showContactModal: false,
    contactMessage: '',
    isContacting: false
  },

  onLoad: function(options) {
    const productId = options.id
    if (productId) {
      this.setData({ productId })
      this.loadProductDetail(productId)
    } else {
      wx.showToast({
        title: '商品不存在',
        icon: 'error'
      })
      wx.navigateBack()
    }
  },

  onShow: function() {
    // 页面显示时刷新数据，但如果有弹窗打开则不刷新
    if (this.data.productId && !this.data.showContactModal) {
      this.loadProductDetail(this.data.productId)
    }
  },

  /**
   * 加载商品详情
   */
  loadProductDetail: function(productId) {
    const that = this
    that.setData({ isLoading: true })
    
    // 使用新的getSecondhandItemById方法直接根据ID查询
    SupabaseAPI.getSecondhandItemById(productId).then(function(product) {
      if (product) {
        // 获取卖家信息（这里需要根据实际的表结构调整）
        const sellerInfo = product.profiles || {
          nickname: '用户',
          avatar_url: '/images/default-avatar.png'
        }

        const fullProduct = {
          ...product,
          seller: {
            ...sellerInfo,
            name: sellerInfo.nickname || '用户', // WXML中使用的是seller.name
            avatar: sellerInfo.avatar_url || '/images/default-avatar.png', // WXML中使用的是seller.avatar
            rating: 4.5, // 默认评分
            reviewCount: 0,
            responseRate: 95,
            location: product.location || '未知',
            isVerified: false,
            joinTime: '2024-01-01' // 简化显示固定时间
          },
          // 确保images是数组，并添加默认图片和错误处理
          images: Array.isArray(product.images) && product.images.length > 0 ? 
            product.images.map(img => {
              // 检查图片路径是否有效，如果无效则使用默认图片
              if (!img || img.trim() === '' || img === 'null' || img === 'undefined') {
                return '/images/default-product.jpg'
              }
              return img
            }) : 
            ['/images/default-product.jpg'],
          publishTime: product.created_at ? product.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          viewCount: product.view_count || 0,
          inquiryCount: product.inquiry_count || 0,
          favoriteCount: product.favorite_count || 0,
          // 处理价格显示
          price: product.price || 0,
          originalPrice: product.original_price || 0,
          // 处理分类和成色
          categoryName: product.category_name || '其他',
          condition: that.formatCondition(product.condition),
          usageTime: that.formatUsageTime(product.usage_time),
          deliveryOptions: ['自提', '同程配送'],
          paymentMethods: ['微信支付', '支付宝', '现金']
        }

        that.setData({
          product: fullProduct,
          isLoading: false
        })
        
        // 记录浏览量
        SupabaseAPI.incrementItemViewCount(productId)
      } else {
        // 商品不存在
        that.setData({ isLoading: false })
        wx.showToast({
          title: '商品不存在或已删除',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    }).catch(function(error) {
      console.error('加载商品详情失败:', error)
      that.setData({ isLoading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    })
  },

  /**
   * 增加浏览量
   */
  incrementViewCount: function(productId) {
    console.log('商品浏览量 +1:', productId)
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
   * 切换收藏状态
   */
  async toggleLike() {
    try {
      const userProfile = wx.getStorageSync('userProfile')
      
      // 检查用户是否已登录
      if (!userProfile || !userProfile.id) {
        wx.showToast({
          title: '请先登录后再收藏商品',
          icon: 'none'
        })
        return
      }
      
      // 检查用户ID格式
      let profileId = userProfile.id
      if (!profileId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)) {
        wx.showToast({
          title: '用户信息错误，请重新登录',
          icon: 'none'
        })
        return
      }
      
      const isLiked = await SupabaseAPI.toggleItemFavorite(this.data.product.id, profileId)
      
      this.setData({ isLiked })
      
      const product = this.data.product
      product.favoriteCount += isLiked ? 1 : -1
      this.setData({ product })
      
      wx.showToast({
        title: isLiked ? '已收藏' : '已取消收藏',
        icon: 'success'
      })
    } catch (error) {
      console.error('收藏操作失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      })
    }
  },

  /**
   * 联系卖家 - 使用微信官方弹窗
   */
  contactSeller: function() {
    console.log('🔘 联系卖家按钮被点击')
    
    // 获取当前用户信息
    const app = getApp()
    const currentUserProfile = app.getUserProfile()
    
    if (!currentUserProfile || !currentUserProfile.id) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再联系卖家',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }
    
    const product = this.data.product
    const sellerId = product.profile_id
    const senderId = currentUserProfile.id
    
    // 检查是否是联系自己的商品
    if (sellerId === senderId) {
      wx.showModal({
        title: '提示',
        content: '不能联系自己的商品',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }
    
    // 使用微信官方弹窗组件
    wx.showModal({
      title: '联系卖家',
      editable: true,
      placeholderText: '请输入您想对卖家说的话...',
      confirmText: '发送',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 检查输入内容是否为空
          if (!res.content || !res.content.trim()) {
            wx.showToast({
              title: '请输入留言内容',
              icon: 'none'
            })
            return
          }
          // 发送消息
          this.sendContactMessage(res.content)
        }
      }
    })
  },

  /**
   * 发送联系消息
   */
  sendContactMessage: function(messageContent) {
    const that = this
    
    // 获取当前用户信息（同步获取）
    const app = getApp()
    const currentUserProfile = app.getUserProfile()
    
    if (!currentUserProfile || !currentUserProfile.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    const product = that.data.product
    const sellerId = product.profile_id
    const senderId = currentUserProfile.id
    
    // 检查是否是联系自己的商品
    if (sellerId === senderId) {
      wx.showToast({
        title: '不能联系自己的商品',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '发送中...',
      mask: true
    })

    // 发送消息到数据库
    SupabaseAPI.sendMessage(
      product.id,
      senderId,
      sellerId,
      messageContent,
      'inquiry'
    ).then(function(result) {
      console.log('消息发送结果:', result)
      // 更新商品咨询次数
      return SupabaseAPI.incrementItemInquiryCount(product.id)
    }).then(function() {
      wx.hideLoading()
      wx.showToast({
        title: '消息已发送',
        icon: 'success'
      })
      
      that.setData({
        showContactModal: false,
        contactMessage: ''
      })
    }).catch(function(error) {
      wx.hideLoading()
      console.error('发送消息失败:', error)
      wx.showToast({
        title: '发送失败，请重试',
        icon: 'none'
      })
    })
  },

  /**
   * 关闭联系弹窗
   */
  closeContactModal: function() {
    this.setData({
      showContactModal: false,
      contactMessage: ''
    })
  },

  /**
   * 拨打电话
   */
  makePhoneCall: function() {
    // 这里应该显示真实的电话号码
    wx.showModal({
      title: '联系方式',
      content: '为了保护用户隐私，请先通过站内信联系卖家',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  /**
   * 分享商品
   */
  onShareAppMessage: function() {
    const product = this.data.product
    return {
      title: `${product.title} - ¥${product.price}`,
      path: `/pages/market/product-detail?id=${product.id}`,
      imageUrl: product.images[0]
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline: function() {
    const product = this.data.product
    return {
      title: `${product.title} - 闲置转让 ¥${product.price}`,
      imageUrl: product.images[0]
    }
  },

  /**
   * 举报商品
   */
  reportProduct: function() {
    wx.showActionSheet({
      itemList: ['虚假信息', '价格欺诈', '违禁品', '骚扰信息', '其他'],
      success: (res) => {
        const reasons = ['虚假信息', '价格欺诈', '违禁品', '骚扰信息', '其他']
        const reason = reasons[res.tapIndex]
        
        wx.showModal({
          title: '确认举报',
          content: `确定要举报这个商品吗？\n举报原因：${reason}`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              // 这里应该发送举报请求到服务器
              wx.showToast({
                title: '举报成功',
                icon: 'success'
              })
            }
          }
        })
      }
    })
  },

  /**
   * 输入留言内容
   */
  onMessageInput: function(e) {
    this.setData({
      contactMessage: e.detail.value
    })
  },

  // 格式化成色显示
  formatCondition: function(condition) {
    const conditionMap = {
      'new': '全新',
      '95new': '95成新',
      '9new': '9成新',
      '8new': '8成新',
      '7new': '7成新及以下'
    }
    return conditionMap[condition] || condition || '9成新'
  },

  // 格式化使用时间显示
  formatUsageTime: function(usageTime) {
    const usageTimeMap = {
      'unused': '未使用',
      '1-3months': '1-3个月',
      '3-6months': '3-6个月',
      '6-12months': '6-12个月',
      '1-2years': '1-2年',
      '2years+': '2年以上'
    }
    return usageTimeMap[usageTime] || usageTime || '3-6个月'
  }
})