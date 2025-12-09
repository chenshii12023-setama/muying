/**
 * 诊断数据库状态
 * 检查商品表是否存在以及结构是否正确
 */

const SupabaseAPI = require('./supabase_config.js')

async function diagnoseDatabase() {
  console.log('🔍 开始诊断数据库状态...')
  
  try {
    // 测试连接
    const useLocalStorage = await SupabaseAPI.testConnection()
    console.log('📡 连接模式:', useLocalStorage ? '本地存储' : '数据库')
    
    if (useLocalStorage) {
      console.log('⚠️ 数据库连接失败，使用本地存储模式')
      console.log('💡 请检查：')
      console.log('   1. Supabase URL 和 Key 是否正确')
      console.log('   2. 网络连接是否正常')
      console.log('   3. Supabase 项目是否正常运行')
      return
    }
    
    console.log('✅ 数据库连接正常')
    
    // 尝试获取商品列表（这会测试表是否存在）
    try {
      console.log('📋 检查 secondhand_items 表...')
      const products = await SupabaseAPI.getSecondhandItems()
      console.log(`✅ secondhand_items 表存在，包含 ${products.length} 条记录`)
      
      // 显示前几个商品的结构
      if (products.length > 0) {
        console.log('📊 商品数据结构示例:')
        const sample = products[0]
        Object.keys(sample).forEach(key => {
          console.log(`   ${key}: ${typeof sample[key]} (${sample[key]})`)
        })
      }
      
    } catch (tableError) {
      console.log('❌ secondhand_items 表不存在或无法访问')
      console.log('🛠️ 解决方案:')
      console.log('   1. 在 Supabase Dashboard 中执行 create_products_simple.sql')
      console.log('   2. 或执行 fix_products_table.sql 修复现有表')
      console.log('   3. 检查 RLS 策略是否正确配置')
    }
    
    // 测试创建商品（最小数据）
    try {
      console.log('🧪 测试创建商品...')
      const testProduct = {
        title: '测试商品',
        description: '这是一个测试商品',
        price: 99.99,
        category: 'test',
        condition: '测试',
        location: '测试地点'
      }
      
      const created = await SupabaseAPI.createSecondhandItem(1, testProduct)
      console.log('✅ 创建商品成功，ID:', created.id)
      
      // 立即删除测试商品
      await SupabaseAPI.deleteSecondhandItem(created.id)
      console.log('✅ 删除测试商品成功')
      
    } catch (createError) {
      console.log('❌ 创建商品失败:', createError.message)
      
      if (createError.message.includes('column')) {
        console.log('🔧 列错误解决方案:')
        console.log('   1. 执行 fix_products_table.sql 添加缺失的列')
        console.log('   2. 或执行 create_products_simple.sql 重建表')
      }
    }
    
    console.log('\n📝 诊断完成！')
    
  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error.message)
  }
}

// 如果直接运行此文件，执行诊断
if (require.main === module) {
  diagnoseDatabase()
}

module.exports = diagnoseDatabase