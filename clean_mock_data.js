// 清理模拟数据脚本
console.log('开始清理模拟数据...')

try {
  // 清理市场商品数据
  const marketProducts = wx.getStorageSync('marketProducts') || []
  const cleanedMarketProducts = marketProducts.filter(product => product.id > 1000000)
  wx.setStorageSync('marketProducts', cleanedMarketProducts)
  
  // 清理我的发布数据
  const myProducts = wx.getStorageSync('myProducts') || []
  const cleanedMyProducts = myProducts.filter(product => product.id > 1000000)
  wx.setStorageSync('myProducts', cleanedMyProducts)
  
  // 清理愿望清单数据
  const wishlist = wx.getStorageSync('wishlist') || []
  wx.removeStorageSync('wishlist')
  
  console.log('清理完成!')
  console.log('市场商品:', cleanedMarketProducts.length)
  console.log('我的发布:', cleanedMyProducts.length)
  
  // 清理所有本地存储（可选）
  // wx.clearStorageSync()
  
} catch (error) {
  console.error('清理失败:', error)
}