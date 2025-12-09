// 测试浏览量和咨询次数更新功能
const https = require('https');

const supabaseUrl = 'https://zbhlrnecjmdpuaxvhneu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, supabaseUrl);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusText} - ${data}`));
          }
        } catch (e) {
          reject(new Error(`解析响应失败: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// 模拟 incrementItemViewCount 方法
async function incrementItemViewCount(itemId) {
  try {
    // 先获取当前浏览量
    const currentItem = await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}&select=view_count`);
    if (currentItem && currentItem.length > 0) {
      const currentViewCount = currentItem[0].view_count || 0;
      const newViewCount = currentViewCount + 1;
      
      // 更新浏览量
      await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', {
        view_count: newViewCount
      });
      
      console.log(`✅ 浏览量更新成功: ${currentViewCount} -> ${newViewCount}`);
      return newViewCount;
    }
  } catch (error) {
    console.warn('更新浏览量失败:', error.message);
    return null;
  }
}

// 模拟 incrementItemInquiryCount 方法
async function incrementItemInquiryCount(itemId) {
  try {
    // 先获取当前咨询次数
    const currentItem = await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}&select=inquiry_count`);
    if (currentItem && currentItem.length > 0) {
      const currentInquiryCount = currentItem[0].inquiry_count || 0;
      const newInquiryCount = currentInquiryCount + 1;
      
      // 更新咨询次数
      await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', {
        inquiry_count: newInquiryCount
      });
      
      console.log(`✅ 咨询次数更新成功: ${currentInquiryCount} -> ${newInquiryCount}`);
      return newInquiryCount;
    }
  } catch (error) {
    console.warn('更新咨询次数失败:', error.message);
    return null;
  }
}

async function testCountUpdates() {
  console.log('🧪 测试浏览量和咨询次数更新功能...\n');
  
  try {
    // 1. 获取测试商品
    console.log('📦 获取测试商品...');
    const items = await makeRequest('/rest/v1/secondhand_items?select=id,title,view_count,inquiry_count&limit=1');
    
    if (!items || items.length === 0) {
      console.error('❌ 没有找到测试商品');
      return;
    }
    
    const product = items[0];
    console.log(`✅ 找到测试商品: ${product.title}`);
    console.log(`📊 当前浏览量: ${product.view_count || 0}`);
    console.log(`📞 当前咨询次数: ${product.inquiry_count || 0}\n`);
    
    // 2. 测试浏览量更新
    console.log('👀 测试浏览量更新...');
    const newViewCount = await incrementItemViewCount(product.id);
    
    if (newViewCount !== null) {
      console.log(`📈 浏览量更新后: ${newViewCount}`);
    } else {
      console.log('❌ 浏览量更新失败');
    }
    
    console.log();
    
    // 3. 测试咨询次数更新
    console.log('💬 测试咨询次数更新...');
    const newInquiryCount = await incrementItemInquiryCount(product.id);
    
    if (newInquiryCount !== null) {
      console.log(`📈 咨询次数更新后: ${newInquiryCount}`);
    } else {
      console.log('❌ 咨询次数更新失败');
    }
    
    console.log();
    
    // 4. 验证最终结果
    console.log('🔍 验证最终结果...');
    const finalItem = await makeRequest(`/rest/v1/secondhand_items?id=eq.${product.id}&select=view_count,inquiry_count`);
    
    if (finalItem && finalItem.length > 0) {
      const final = finalItem[0];
      console.log(`✅ 最终浏览量: ${final.view_count}`);
      console.log(`✅ 最终咨询次数: ${final.inquiry_count}`);
      console.log('\n🎉 浏览量和咨询次数更新功能测试完成！');
    } else {
      console.log('❌ 无法获取最终结果');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testCountUpdates().then(() => {
  console.log('\n🏁 测试完成');
}).catch(console.error);