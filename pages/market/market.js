const app = getApp()

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

  onLoad: function(options) {
    // 首先清理所有模拟数据
    this.cleanMockData()
    
    this.loadProducts()
    this.loadMyProducts()
    this.loadWishlist()
  },

  /**
   * 清理所有模拟数据
   */
  cleanMockData: function() {
    try {
      // 清理市场商品中的模拟数据（保留时间戳ID的商品）
      let marketProducts = wx.getStorageSync('marketProducts') || []
      marketProducts = marketProducts.filter(product => product.id > 1000000)
      wx.setStorageSync('marketProducts', marketProducts)
      
      // 清理我的发布中的模拟数据
      let myProducts = wx.getStorageSync('myProducts') || []
      myProducts = myProducts.filter(product => product.id > 1000000)
      wx.setStorageSync('myProducts', myProducts)
      
      console.log('已清理所有模拟数据')
    } catch (error) {
      console.error('清理模拟数据失败:', error)
    }
  },

  onShow: function() {
    this.loadMyProducts()
    this.loadWishlist()
  },

  loadProducts: function() {
    try {
      // 只从本地存储获取用户上传的商品数据
      let marketProducts = wx.getStorageSync('marketProducts') || []
      
      // 清理所有模拟数据，只保留用户上传的商品
      marketProducts = marketProducts.filter(product => product.id > 1000000) // 只保留时间戳ID的商品
      
      // 保存清理后的数据
      wx.setStorageSync('marketProducts', marketProducts)
      
      this.setData({
        productList: marketProducts
      })
      
    } catch (error) {
      console.error('加载商品列表失败:', error)
      this.setData({
        productList: []
      })
    }
  },

  loadMyProducts: function() {
    try {
      // 从本地存储获取我的发布商品
      let myProducts = wx.getStorageSync('myProducts') || []
      
      // 清理所有模拟数据，只保留用户上传的商品
      myProducts = myProducts.filter(product => product.id > 1000000) // 只保留时间戳ID的商品
      
      // 保存清理后的数据
      wx.setStorageSync('myProducts', myProducts)
      
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

  loadWishlist: function() {
    // 模拟愿望清单数据
    const wishlist = [
      {
        id: 201,
        product: {
          id: 3,
          title: '实木婴儿床带床垫',
          price: 500,
          images: ['/images/products/crib-1.jpg']
        },
        addedTime: '2024-01-15 14:30'
      }
    ]
    
    this.setData({
      wishlist: wishlist
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
    
    this.searchProducts(e.detail.value)
  },

  searchProducts: function(keyword) {
    if (!keyword) {
      this.loadProducts()
      return
    }
    
    const filtered = this.data.productList.filter(product => 
      product.title.includes(keyword) || 
      product.description.includes(keyword)
    )
    
    this.setData({
      productList: filtered
    })
  },

  onCategoryTap: function(e) {
    const category = e.currentTarget.dataset.value
    this.setData({
      activeCategory: category
    })
    
    if (category === 'all') {
      this.loadProducts()
    } else {
      const filtered = this.data.productList.filter(product => 
        product.category === category
      )
      
      this.setData({
        productList: filtered
      })
    }
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

  deleteProduct: function(e) {
    const id = e.currentTarget.dataset.id
    const that = this
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个商品吗？',
      success: function(res) {
        if (res.confirm) {
          const products = that.data.myProducts.filter(item => item.id !== id)
          that.setData({
            myProducts: products
          })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
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