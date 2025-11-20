// 微信小程序环境测试工具
// 不依赖 Node.js 模块，专门用于小程序环境

const testSupabaseInMiniprogram = () => {
  console.log('🚀 小程序环境 Supabase 连接测试')
  
  // 直接测试 Supabase 连接
  const testUrl = 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/baby_food_recipes?limit=1'
  const testKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o'
  
  wx.request({
    url: testUrl,
    method: 'GET',
    header: {
      'apikey': testKey,
      'Authorization': 'Bearer ' + testKey,
      'Content-Type': 'application/json'
    },
    success: (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Supabase 连接成功!')
        console.log('📊 查询到', res.data.length, '条数据')
        if (res.data.length > 0) {
          console.log('🥕 示例食谱:', res.data[0].title)
        }
      } else {
        console.log('❌ 连接失败:', res.statusCode)
        console.log('📄 错误信息:', res.data)
      }
    },
    fail: (error) => {
      console.log('❌ 网络请求失败:', error.errMsg)
    }
  })
}

module.exports = {
  testSupabaseInMiniprogram
}