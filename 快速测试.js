// 快速功能测试 - 测试实际可用的功能

// 测试小程序环境的 Supabase 连接
const testRealFunction = async () => {
  console.log('🧪 测试实际可用功能...');
  
  // 1. 测试基础连接
  console.log('\n1️⃣ 测试数据库连接...');
  wx.request({
    url: 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/baby_food_recipes?limit=1',
    method: 'GET',
    header: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o'
    },
    success: (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ 基础连接正常');
        console.log('   📊 返回数据:', res.data);
        
        // 2. 测试数据创建
        console.log('\n2️⃣ 测试创建测试用户...');
        const testUser = {
          nickname: '测试用户-' + Date.now(),
          phone_number: '13800138000',
          created_at: new Date().toISOString()
        };
        
        wx.request({
          url: 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/profiles',
          method: 'POST',
          data: testUser,
          header: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
            'Content-Type': 'application/json'
          },
          success: (res2) => {
            if (res2.statusCode === 201) {
              console.log('   ✅ 用户创建成功');
              console.log('   👤 用户ID:', res2.data[0].id);
              
              // 3. 测试添加宝宝
              console.log('\n3️⃣ 测试添加宝宝...');
              const testBaby = {
                name: '测试宝宝-' + Date.now(),
                gender: 'male',
                birth_date: '2024-01-01',
                is_active: true
              };
              
              wx.request({
                url: 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies',
                method: 'POST',
                data: { ...testBaby, profile_id: res2.data[0].id },
                header: {
                  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
                  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
                  'Content-Type': 'application/json'
                },
                success: (res3) => {
                  if (res3.statusCode === 201) {
                    console.log('   ✅ 宝宝创建成功');
                    console.log('   👶 宝宝ID:', res3.data[0].id);
                    console.log('\n🎉 数据库功能完全可用！');
                  } else {
                    console.log('   ❌ 宝宝创建失败:', res3.statusCode, res3.data);
                  }
                },
                fail: (err) => {
                  console.log('   ❌ 宝宝创建请求失败:', err);
                }
              });
              
            } else {
              console.log('   ❌ 用户创建失败:', res2.statusCode, res2.data);
            }
          },
          fail: (err) => {
            console.log('   ❌ 用户创建请求失败:', err);
          }
        });
        
      } else {
        console.log('   ❌ 连接失败:', res.statusCode, res.data);
      }
    },
    fail: (err) => {
      console.log('   ❌ 请求失败:', err);
    }
  });
};

// 在微信开发者工具控制台运行此函数测试实际功能
console.log('🚀 在控制台运行: testRealFunction() 来测试实际数据库功能');