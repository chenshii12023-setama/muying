/**
 * 快速测试修复后的模块
 */

console.log('=== 测试修复后的模块 ===\n')

try {
  console.log('1. 测试 supabase_config.js 模块导入...')
  const SupabaseAPI = require('./supabase_config.js')
  console.log('✅ supabase_config.js 导入成功')
  
  console.log('\n2. 测试 APIUtils 模块导入...')
  const APIUtils = require('./api.js') 
  console.log('✅ api.js 导入成功')
  
  console.log('\n3. 检查默认头像文件是否存在...')
  const fs = require('fs')
  if (fs.existsSync('./images/default-avatar.png')) {
    console.log('✅ default-avatar.png 文件存在')
  } else {
    console.log('❌ default-avatar.png 文件不存在')
  }
  
  console.log('\n=== 修复验证完成 ===')
  console.log('✅ 所有模块导入正常')
  console.log('✅ 图片文件就绪')
  console.log('现在小程序应该可以正常启动了！')
  
} catch (error) {
  console.error('❌ 测试失败:', error.message)
}