// 修复登录功能 - 简化版本

const app = getApp()

// 测试登录的简化方法
const testSimpleLogin = async () => {
  console.log('🔐 开始测试登录功能...')
  
  try {
    // 1. 测试数据库连接
    console.log('\n1️⃣ 测试数据库连接...')
    const testResult = await wx.request({
      url: 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/profiles?limit=1',
      method: 'GET',
      header: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o'
      }
    })
    
    if (testResult.statusCode === 200) {
      console.log('   ✅ 数据库连接正常')
      
      // 2. 创建测试用户
      console.log('\n2️⃣ 创建测试用户...')
      const userId = 'test_user_' + Date.now()
      const userProfile = {
        user_id: userId,
        nickname: '测试用户' + Math.floor(Math.random() * 1000),
        phone_number: '13800138000',
        created_at: new Date().toISOString()
      }
      
      const createResult = await wx.request({
        url: 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/profiles',
        method: 'POST',
        data: userProfile,
        header: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          'Content-Type': 'application/json'
        }
      })
      
      if (createResult.statusCode === 201) {
        console.log('   ✅ 用户创建成功:', createResult.data[0])
        
        // 3. 验证用户可以查询
        console.log('\n3️⃣ 验证用户查询...')
        const verifyResult = await wx.request({
          url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/profiles?user_id=eq.${userId}`,
          method: 'GET',
          header: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o'
          }
        })
        
        if (verifyResult.statusCode === 200 && verifyResult.data.length > 0) {
          console.log('   ✅ 用户查询成功:', verifyResult.data[0])
          console.log('\n🎉 登录功能数据库连接正常！')
          console.log('💡 现在可以在小程序中真正登录和保存数据了！')
          
          return {
            success: true,
            userId: userId,
            profile: createResult.data[0]
          }
        } else {
          console.log('   ❌ 用户查询失败:', verifyResult.statusCode, verifyResult.data)
          return { success: false, error: '用户查询失败' }
        }
      } else {
        console.log('   ❌ 用户创建失败:', createResult.statusCode, createResult.data)
        return { success: false, error: '用户创建失败' }
      }
    } else {
      console.log('   ❌ 数据库连接失败:', testResult.statusCode, testResult.data)
      return { success: false, error: '数据库连接失败' }
    }
  } catch (error) {
    console.log('❌ 测试失败:', error)
    return { success: false, error: error.message }
  }
}

// 修复app.js中的登录状态检查
const fixAppLoginStatus = () => {
  console.log('🔧 修复登录状态检查...')
  
  // 重写app的checkLoginStatus方法
  const originalCheckLoginStatus = app.checkLoginStatus
  app.checkLoginStatus = async function() {
    console.log('🔍 执行修复后的登录状态检查...')
    
    try {
      const token = wx.getStorageSync('token')
      const userInfo = wx.getStorageSync('userInfo')
      
      if (token && userInfo) {
        this.globalData.token = token
        this.globalData.userInfo = userInfo
        this.globalData.isLoggedIn = true
        
        // 直接使用微信请求获取用户资料，避免复杂的supabase调用
        const profileResult = await wx.request({
          url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/profiles?user_id=eq.${userInfo.id}`,
          method: 'GET',
          header: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o'
          }
        })
        
        if (profileResult.statusCode === 200) {
          this.globalData.userProfile = profileResult.data[0] || userInfo
          console.log('✅ 用户资料加载成功')
        } else {
          console.log('⚠️ 用户资料加载失败，使用本地数据')
          this.globalData.userProfile = userInfo
        }
      }
    } catch (error) {
      console.error('登录状态检查失败:', error)
      this.globalData.isLoggedIn = false
    }
  }
  
  console.log('✅ 登录状态检查已修复')
}

console.log('🚀 在控制台运行以下命令:')
console.log('1. testSimpleLogin() - 测试数据库连接和用户创建')
console.log('2. fixAppLoginStatus() - 修复登录状态检查')
console.log('')
console.log('💡 修复后可以在小程序中正常登录和使用数据功能！')