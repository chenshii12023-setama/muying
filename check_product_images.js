// 检查商品图片数据
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

async function checkProductImages() {
  console.log('🖼️ 检查商品图片数据...\n');
  
  try {
    // 获取几个商品数据
    const products = await makeRequest('/rest/v1/secondhand_items?select=id,title,images&limit=3');
    
    if (!products || products.length === 0) {
      console.log('❌ 没有找到商品数据');
      return;
    }
    
    products.forEach((product, index) => {
      console.log(`📦 商品 ${index + 1}: ${product.title}`);
      console.log(`🆔 ID: ${product.id}`);
      console.log(`🖼️ 图片数据:`, product.images);
      console.log(`🔍 图片类型:`, typeof product.images);
      console.log(`📊 是否为数组: ${Array.isArray(product.images)}`);
      console.log(`⚡ 是否有值: ${!!product.images}`);
      
      if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images);
          console.log(`✅ 解析后:`, parsed);
          console.log(`📊 解析后类型:`, typeof parsed);
          console.log(`📊 解析后是数组: ${Array.isArray(parsed)}`);
        } catch (e) {
          console.log(`❌ JSON解析失败: ${e.message}`);
        }
      }
      
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

// 运行检查
checkProductImages().then(() => {
  console.log('\n🏁 检查完成');
}).catch(console.error);