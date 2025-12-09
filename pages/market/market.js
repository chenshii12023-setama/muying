const app = getApp()
const SupabaseAPI = require('../../supabase_config.js')

Page({
  data: {
    activeTab: 'browse',
    searchKeyword: '',
    activeCategory: 'all',
    categoryTags: [
      { label: '全部', value: 'all' },
      { label: '安全座椅', value: 'car-seat' },
      { label: '婴儿车', value: 'stroller' },
      { label: '婴儿床', value: 'crib' },
      { label: '玩具', value: 'toys' },
      { label: '衣物', value: 'clothes' },
      { label: '喂养用品', value: 'feeding' },
      { label: '洗护用品', value: 'bath' }
    ],
    productList: [],
    myProducts: [],
    wishlist: []
  },

  async onLoad(options) {
    // 初始化 Supabase 连接测试
    await SupabaseAPI.testConnection()
    
    this.loadProducts()
    this.loadMyProducts()
    this.loadWishlist()
  },



  onShow() {
    this.loadProducts()
    this.loadMyProducts()
    this.loadWishlist()
  },

  async loadProducts() {
    try {
      // 使用 SupabaseAPI 从数据库加载商品
      const filters = {}
      if (this.data.activeCategory !== 'all') {
        filters.category = this.data.activeCategory
      }
      if (this.data.searchKeyword) {
        filters.search = this.data.searchKeyword
      }
      
      const products = await SupabaseAPI.getSecondhandItems(filters)
      
      this.setData({
        productList: products
      })
      
    } catch (error) {
      console.error('加载商品列表失败:', error)
      this.setData({
        productList: []
      })
    }
  },

  async loadMyProducts() {
    try {
      // 获取用户信息
      const userProfile = wx.getStorageSync('userProfile')
      
      // 如果没有用户信息，显示空列表
      if (!userProfile || !userProfile.id) {
        this.setData({
          myProducts: []
        })
        return
      }
      
      // 检查用户ID格式
      let profileId = userProfile.id
      if (!profileId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)) {
        console.warn('用户ID格式不正确，无法加载商品')
        this.setData({
          myProducts: []
        })
        return
      }
      
      // 使用 SupabaseAPI 加载用户的商品
      const filters = { profile_id: profileId }
      const myProducts = await SupabaseAPI.getSecondhandItems(filters)
      
      this.setData({
        myProducts: myProducts
      })
      
    } catch (error) {
      console.error('加载我的商品失败:', error)
      this.setData({
        myProducts: []
      })
    }
  },

  async loadWishlist() {
    try {
      // 获取用户信息
      const userProfile = wx.getStorageSync('userProfile')
      
      // 如果没有用户信息，显示空列表
      if (!userProfile || !userProfile.id) {
        this.setData({
          wishlist: []
        })
        return
      }
      
      // 检查用户ID格式
      let profileId = userProfile.id
      if (!profileId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)) {
        console.warn('用户ID格式不正确，无法加载收藏')
        this.setData({
          wishlist: []
        })
        return
      }
      
      // 使用 SupabaseAPI 加载收藏列表
      const favorites = await SupabaseAPI.getItemFavorites(profileId)
      
      this.setData({
        wishlist: favorites
      })
      
    } catch (error) {
      console.error('加载收藏列表失败:', error)
      this.setData({
        wishlist: []
      })
    }
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
    
    // 重新加载商品，会自动应用搜索过滤
    this.loadProducts()
  },

  onCategoryTap: function(e) {
    const category = e.currentTarget.dataset.value
    this.setData({
      activeCategory: category
    })
    
    // 重新加载商品，会自动应用分类过滤
    this.loadProducts()
  },

  showSortMenu: function() {
    wx.showActionSheet({
      itemList: ['默认排序', '价格从低到高', '价格从高到低', '距离最近'],
      success: (res) => {
        const index = res.tapIndex
        this.sortProducts(index)
      }
    })
  },

  sortProducts: function(sortType) {
    let sorted = [...this.data.productList]
    
    switch (sortType) {
      case 0: // 默认排序
        sorted = this.data.productList
        break
      case 1: // 价格从低到高
        sorted.sort((a, b) => a.price - b.price)
        break
      case 2: // 价格从高到低
        sorted.sort((a, b) => b.price - a.price)
        break
      case 3: // 距离最近
        sorted.sort((a, b) => a.distance - b.distance)
        break
    }
    
    this.setData({
      productList: sorted
    })
  },

  viewProductDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/market/product-detail?id=${id}`
    })
  },

  resetFilters: function() {
    this.setData({
      searchKeyword: '',
      activeCategory: 'all'
    })
    this.loadProducts()
  },

  addNewProduct: function() {
    wx.navigateTo({
      url: '/pages/market/add-product'
    })
  },

  editProduct: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/market/edit-product?id=${id}`
    })
  },

  refreshProduct: function(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  },

  async deleteProduct(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 使用 SupabaseAPI 删除商品
            await SupabaseAPI.deleteSecondhandItem(id)
            
            // 重新加载商品列表
            this.loadProducts()
            this.loadMyProducts()
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
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
  },

  contactSeller: function(e) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/chat/chat?productId=${productId}`
    })
  },

  removeFromWishlist: function(e) {
    const id = e.currentTarget.dataset.id
    const wishlist = this.data.wishlist.filter(item => item.id !== id)
    
    this.setData({
      wishlist: wishlist
    })
    
    wx.showToast({
      title: '已移除',
      icon: 'success'
    })
  }
})