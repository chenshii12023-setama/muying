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
    this.loadProducts()
    this.loadMyProducts()
    this.loadWishlist()
  },

  onShow: function() {
    this.loadMyProducts()
    this.loadWishlist()
  },

  loadProducts: function() {
    // 模拟商品数据
    const products = [
      {
        id: 1,
        title: '9成新儿童安全座椅 ISOFIX接口',
        price: 380,
        originalPrice: 1200,
        images: ['/images/products/car-seat-1.jpg'],
        category: 'car-seat',
        hasCertification: true,
        isLocal: true,
        distance: 1.2,
        seller: {
          id: 1,
          name: '宝妈小王',
          avatar: '/images/avatars/user1.jpg',
          rating: 4.8,
          reviewCount: 45
        },
        description: '宝宝长大了用不上了，座椅完好，支持ISOFIX接口，有消毒证明',
        condition: '9成新',
        usageTime: '6个月',
        location: '浦东新区陆家嘴'
      },
      {
        id: 2,
        title: '轻便型婴儿推车可折叠',
        price: 250,
        originalPrice: 600,
        images: ['/images/products/stroller-1.jpg'],
        category: 'stroller',
        hasCertification: false,
        isLocal: true,
        distance: 0.8,
        seller: {
          id: 2,
          name: '宝爸小李',
          avatar: '/images/avatars/user2.jpg',
          rating: 4.9,
          reviewCount: 28
        },
        description: '闲置婴儿推车，功能完好，一键折叠，适合6个月以上宝宝',
        condition: '8成新',
        usageTime: '1年',
        location: '黄浦区人民广场'
      },
      {
        id: 3,
        title: '实木婴儿床带床垫',
        price: 500,
        originalPrice: 1500,
        images: ['/images/products/crib-1.jpg'],
        category: 'crib',
        hasCertification: true,
        isLocal: true,
        distance: 2.5,
        seller: {
          id: 3,
          name: '双胞胎妈妈',
          avatar: '/images/avatars/user3.jpg',
          rating: 4.7,
          reviewCount: 67
        },
        description: '宝宝分房睡了，实木婴儿床带床垫，有安全认证',
        condition: '95成新',
        usageTime: '8个月',
        location: '徐汇区徐家汇'
      },
      {
        id: 4,
        title: '益智早教玩具套装',
        price: 80,
        originalPrice: 200,
        images: ['/images/products/toys-1.jpg'],
        category: 'toys',
        hasCertification: false,
        isLocal: true,
        distance: 1.8,
        seller: {
          id: 4,
          name: '育儿专家',
          avatar: '/images/avatars/user4.jpg',
          rating: 4.6,
          reviewCount: 89
        },
        description: '适合1-3岁宝宝的益智玩具，激发宝宝创造力',
        condition: '全新',
        usageTime: '未使用',
        location: '静安区南京西路'
      }
    ]
    
    this.setData({
      productList: products
    })
  },

  loadMyProducts: function() {
    // 模拟我的商品数据
    const myProducts = [
      {
        id: 101,
        title: '婴儿学步车多功能',
        price: 150,
        images: ['/images/products/walker-1.jpg'],
        status: 'selling',
        statusText: '出售中',
        viewCount: 45,
        inquiryCount: 8,
        favoriteCount: 3,
        publishTime: '2024-01-10'
      },
      {
        id: 102,
        title: '新生儿衣物礼盒',
        price: 120,
        images: ['/images/products/clothes-1.jpg'],
        status: 'sold',
        statusText: '已售出',
        viewCount: 67,
        inquiryCount: 12,
        favoriteCount: 5,
        publishTime: '2024-01-05'
      }
    ]
    
    this.setData({
      myProducts: myProducts
    })
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