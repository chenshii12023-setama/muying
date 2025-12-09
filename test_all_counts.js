// 测试所有计数更新功能（浏览量、咨询次数、收藏次数）
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

// 获取商品信息
async function getItem(itemId) {
  return await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}&select=title,view_count,inquiry_count,favorite_count`);
}

// 更新浏览量
async function incrementItemViewCount(itemId) {
  try {
    const currentItem = await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}&select=view_count`);
    if (currentItem && currentItem.length > 0) {
      const currentViewCount = currentItem[0].view_count || 0;
      const newViewCount = currentViewCount + 1;
      
      await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', {
        view_count: newViewCount
      });
      
      console.log(`✅ 浏览量更新: ${currentViewCount} -> ${newViewCount}`);
      return newViewCount;
    }
  } catch (error) {
    console.warn('更新浏览量失败:', error.message);
    return null;
  }
}

// 更新咨询次数
async function incrementItemInquiryCount(itemId) {
  try {
    const currentItem = await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}&select=inquiry_count`);
    if (currentItem && currentItem.length > 0) {
      const currentInquiryCount = currentItem[0].inquiry_count || 0;
      const newInquiryCount = currentInquiryCount + 1;
      
      await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', {
        inquiry_count: newInquiryCount
      });
      
      console.log(`✅ 咨询次数更新: ${currentInquiryCount} -> ${newInquiryCount}`);
      return newInquiryCount;
    }
  } catch (error) {
    console.warn('更新咨询次数失败:', error.message);
    return null;
  }
}

// 增加收藏次数
async function incrementItemFavoriteCount(itemId) {
  try {
    const currentItem = await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}&select=favorite_count`);
    if (currentItem && currentItem.length > 0) {
      const currentFavoriteCount = currentItem[0].favorite_count || 0;
      const newFavoriteCount = currentFavoriteCount + 1;
      
      await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', {
        favorite_count: newFavoriteCount
      });
      
      console.log(`✅ 收藏次数增加: ${currentFavoriteCount} -> ${newFavoriteCount}`);
      return newFavoriteCount;
    }
  } catch (error) {
    console.warn('增加收藏次数失败:', error.message);
    return null;
  }
}

// 减少收藏次数
async function decrementItemFavoriteCount(itemId) {
  try {
    const currentItem = await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}&select=favorite_count`);
    if (currentItem && currentItem.length > 0) {
      const currentFavoriteCount = currentItem[0].favorite_count || 0;
      const newFavoriteCount = Math.max(0, currentFavoriteCount - 1);
      
      await makeRequest(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', {
        favorite_count: newFavoriteCount
      });
      
      console.log(`✅ 收藏次数减少: ${currentFavoriteCount} -> ${newFavoriteCount}`);
      return newFavoriteCount;
    }
  } catch (error) {
    console.warn('减少收藏次数失败:', error.message);
    return null;
  }
}

async function testAllCounts() {
  console.log('🧪 测试所有计数更新功能...\n');
  
  try {
    // 1. 获取测试商品
    console.log('📦 获取测试商品...');
    const items = await makeRequest('/rest/v1/secondhand_items?select=id,title,view_count,inquiry_count,favorite_count&limit=1');
    
    if (!items || items.length === 0) {
      console.error('❌ 没有找到测试商品');
      return;
    }
    
    const product = items[0];
    console.log(`✅ 找到测试商品: ${product.title}`);
    console.log(`📊 初始计数 - 浏览量: ${product.view_count || 0}, 咨询次数: ${product.inquiry_count || 0}, 收藏次数: ${product.favorite_count || 0}\n`);
    
    // 2. 测试浏览量更新
    console.log('👀 测试浏览量更新...');
    await incrementItemViewCount(product.id);
    
    // 3. 测试咨询次数更新
    console.log('\n💬 测试咨询次数更新...');
    await incrementItemInquiryCount(product.id);
    
    // 4. 测试收藏次数增加
    console.log('\n❤️ 测试收藏次数增加...');
    await incrementItemFavoriteCount(product.id);
    
    // 5. 测试收藏次数减少
    console.log('\n💔 测试收藏次数减少...');
    await decrementItemFavoriteCount(product.id);
    
    // 6. 再次测试收藏次数增加（验证减少功能）
    console.log('\n❤️ 再次测试收藏次数增加...');
    await incrementItemFavoriteCount(product.id);
    
    // 7. 验证最终结果
    console.log('\n🔍 验证最终结果...');
    const finalItem = await getItem(product.id);
    
    if (finalItem && finalItem.length > 0) {
      const final = finalItem[0];
      console.log(`📊 最终计数:`);
      console.log(`   浏览量: ${final.view_count}`);
      console.log(`   咨询次数: ${final.inquiry_count}`);
      console.log(`   收藏次数: ${final.favorite_count}`);
      
      // 计算预期值
      const expectedViewCount = (product.view_count || 0) + 1;
      const expectedInquiryCount = (product.inquiry_count || 0) + 1;
      const expectedFavoriteCount = (product.favorite_count || 0) + 1; // +1-1+1 = 净增1
      
      console.log(`\n📈 预期结果:`);
      console.log(`   浏览量: ${expectedViewCount}`);
      console.log(`   咨询次数: ${expectedInquiryCount}`);
      console.log(`   收藏次数: ${expectedFavoriteCount}`);
      
      // 验证结果
      const allMatch = 
        final.view_count === expectedViewCount &&
        final.inquiry_count === expectedInquiryCount &&
        final.favorite_count === expectedFavoriteCount;
      
      if (allMatch) {
        console.log('\n🎉 所有计数更新功能测试通过！');
      } else {
        console.log('\n⚠️ 计数更新结果与预期不符');
      }
    } else {
      console.log('❌ 无法获取最终结果');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testAllCounts().then(() => {
  console.log('\n🏁 测试完成');
}).catch(console.error);