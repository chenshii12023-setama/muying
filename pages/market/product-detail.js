const app = getApp()

Page({
  data: {
    productId: null,
    product: null,
    isLoading: true,
    isLiked: false,
    canContact: true,
    showContactModal: false,
    contactMessage: ''
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
    // 页面显示时刷新数据
    if (this.data.productId) {
      this.loadProductDetail(this.data.productId)
    }
  },

  /**
   * 加载商品详情
   */
  loadProductDetail: function(productId) {
    this.setData({ isLoading: true })

    try {
      // 首先尝试从"我的发布"中查找商品
      let myProducts = wx.getStorageSync('myProducts') || []
      let product = myProducts.find(p => p.id == productId)
      
      // 如果我的发布中找不到，从市场商品中查找
      if (!product) {
        let marketProducts = wx.getStorageSync('marketProducts') || []
        product = marketProducts.find(p => p.id == productId)
      }
      
      if (product) {
        // 为商品添加默认的卖家信息（当前用户）
        const userProfile = wx.getStorageSync('userProfile') || {
          id: 1,
          name: '我',
          avatar: '/images/default-avatar.png',
          rating: 5.0,
          reviewCount: 0,
          isVerified: true,
          responseRate: 100,
          location: '当前位置',
          joinTime: '2024-01'
        }

        const fullProduct = {
          ...product,
          seller: userProfile,
          publishTime: product.publishTime || new Date().toISOString().split('T')[0],
          viewCount: product.viewCount || 0,
          inquiryCount: product.inquiryCount || 0,
          favoriteCount: product.favoriteCount || 0,
          deliveryOptions: ['自提', '同程配送'],
          paymentMethods: ['微信支付', '支付宝', '现金']
        }

        this.setData({
          product: fullProduct,
          isLoading: false
        })
        
        // 记录浏览量
        this.incrementViewCount(productId)
      } else {
        // 商品不存在
        this.setData({ isLoading: false })
        wx.showToast({
          title: '商品不存在或已删除',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载商品详情失败:', error)
      this.setData({ isLoading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
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
  toggleLike: function() {
    const isLiked = !this.data.isLiked
    this.setData({ isLiked })
    
    const product = this.data.product
    product.favoriteCount += isLiked ? 1 : -1
    this.setData({ product })
    
    wx.showToast({
      title: isLiked ? '已收藏' : '已取消收藏',
      icon: 'success'
    })
  },

  /**
   * 联系卖家
   */
  contactSeller: function() {
    this.setData({
      showContactModal: true,
      contactMessage: ''
    })
  },

  /**
   * 发送联系消息
   */
  sendContactMessage: function() {
    if (!this.data.contactMessage.trim()) {
      wx.showToast({
        title: '请输入留言内容',
        icon: 'none'
      })
      return
    }

    // 这里应该发送消息到服务器
    console.log('发送消息:', this.data.contactMessage)
    
    wx.showToast({
      title: '消息已发送',
      icon: 'success'
    })
    
    this.setData({
      showContactModal: false,
      contactMessage: ''
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
  }
})