/**
 * 测试商品数据库功能
 * 运行此脚本来验证 Supabase 商品表集成
 */

const SupabaseAPI = require('./supabase_config.js')

async function testProductsDatabase() {
  console.log('🧪 开始测试商品数据库功能...')
  
  try {
    // 1. 测试连接
    console.log('\n1. 测试数据库连接...')
    const useLocalStorage = await SupabaseAPI.testConnection()
    console.log('✅ 连接测试完成，使用本地存储:', useLocalStorage)
    
    // 2. 测试获取商品列表
    console.log('\n2. 测试获取商品列表...')
    const products = await SupabaseAPI.getSecondhandItems()
    console.log(`✅ 获取到 ${products.length} 个商品`)
    
    // 3. 测试按分类筛选
    console.log('\n3. 测试按分类筛选...')
    const strollers = await SupabaseAPI.getSecondhandItems({ category: 'stroller' })
    console.log(`✅ 婴儿车分类有 ${strollers.length} 个商品`)
    
    // 4. 测试搜索功能
    console.log('\n4. 测试搜索功能...')
    const searchResults = await SupabaseAPI.getSecondhandItems({ search: '婴儿' })
    console.log(`✅ 搜索"婴儿"找到 ${searchResults.length} 个商品`)
    
    // 5. 测试创建商品（仅在本地存储模式下）
    if (useLocalStorage) {
      console.log('\n5. 测试创建商品...')
      const testProfileId = 1
      const testProduct = {
        title: '测试商品',
        description: '这是一个测试商品',
        price: 99.99,
        category: 'toys',
        category_name: '玩具',
        condition: '全新',
        usage_time: '未使用',
        location: '测试地点',
        has_certification: false,
        images: ['/images/test.jpg']
      }
      
      const createdProduct = await SupabaseAPI.createSecondhandItem(testProfileId, testProduct)
      console.log('✅ 创建商品成功:', createdProduct.id)
      
      // 6. 测试更新商品
      console.log('\n6. 测试更新商品...')
      const updatedProduct = await SupabaseAPI.updateSecondhandItem(createdProduct.id, {
        price: 88.88
      })
      console.log('✅ 更新商品成功:', updatedProduct.price)
      
      // 7. 测试删除商品
      console.log('\n7. 测试删除商品...')
      await SupabaseAPI.deleteSecondhandItem(createdProduct.id)
      console.log('✅ 删除商品成功')
    }
    
    // 8. 测试收藏功能（仅在本地存储模式下）
    if (useLocalStorage) {
      console.log('\n8. 测试收藏功能...')
      const testProfileId = 1
      const testItemId = 1 // 假设存在ID为1的商品
      
      // 添加收藏
      const added = await SupabaseAPI.toggleItemFavorite(testItemId, testProfileId)
      console.log('✅ 添加收藏:', added)
      
      // 获取收藏列表
      const favorites = await SupabaseAPI.getItemFavorites(testProfileId)
      console.log(`✅ 收藏列表有 ${favorites.length} 个商品`)
      
      // 取消收藏
      const removed = await SupabaseAPI.toggleItemFavorite(testItemId, testProfileId)
      console.log('✅ 取消收藏:', !removed)
    }
    
    console.log('\n🎉 商品数据库功能测试完成！')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 运行测试
if (require.main === module) {
  testProductsDatabase()
}

module.exports = testProductsDatabase