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
  async loadProductDetail(productId) {
    this.setData({ isLoading: true })

    try {
      // 使用新的getSecondhandItemById方法直接根据ID查询
      const product = await SupabaseAPI.getSecondhandItemById(productId)
      
      if (product) {
        // 获取卖家信息（这里需要根据实际的表结构调整）
        const sellerInfo = product.profiles || {
          nickname: '用户',
          avatar_url: '/images/default-avatar.png'
        }

        const fullProduct = {
          ...product,
          seller: sellerInfo,
          publishTime: product.created_at ? product.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          viewCount: product.view_count || 0,
          inquiryCount: product.inquiry_count || 0,
          favoriteCount: product.favorite_count || 0,
          deliveryOptions: ['自提', '同程配送'],
          paymentMethods: ['微信支付', '支付宝', '现金']
        }

        this.setData({
          product: fullProduct,
          isLoading: false
        })
        
        // 记录浏览量
        SupabaseAPI.incrementItemViewCount(productId)
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