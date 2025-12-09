// 调试商品详情加载失败问题
const https = require('https');

const supabaseUrl = 'https://zbhlrnecjmdpuaxvhneu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o';

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, supabaseUrl);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(method === 'GET' ? https.get(options) : options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve({ status: res.statusCode, data: result, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });

        req.on('error', reject);

        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function debugProductDetail() {
    console.log('🔍 调试商品详情加载...\n');
    
    try {
        // 1. 测试商品列表获取
        console.log('📍 1. 测试商品列表API...');
        const itemsResponse = await makeRequest('/rest/v1/secondhand_items?select=id,title,status&limit=5');
        console.log(`商品列表状态码: ${itemsResponse.status}`);
        
        if (itemsResponse.status === 200 && itemsResponse.data.length > 0) {
            console.log(`找到 ${itemsResponse.data.length} 个商品:`);
            itemsResponse.data.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.title} (ID: ${item.id}, 状态: ${item.status})`);
            });
            
            // 2. 测试第一个商品的详情API
            const firstItem = itemsResponse.data[0];
            console.log(`\n📍 2. 测试商品详情API - 商品ID: ${firstItem.id}`);
            
            // 测试不同版本的API调用
            console.log('\n--- API测试 ---');
            
            // 2.1 测试新的getSecondhandItemById方法
            console.log('2.1 测试新API (getSecondhandItemById):');
            try {
                const newApiResponse = await makeRequest(`/rest/v1/secondhand_items?id=eq.${firstItem.id}&select=*,profiles(nickname,avatar_url)`);
                console.log(`  状态码: ${newApiResponse.status}`);
                if (newApiResponse.status === 200) {
                    console.log(`  返回数据长度: ${Array.isArray(newApiResponse.data) ? newApiResponse.data.length : 'N/A'}`);
                    if (Array.isArray(newApiResponse.data) && newApiResponse.data.length > 0) {
                        const product = newApiResponse.data[0];
                        console.log(`  商品标题: ${product.title}`);
                        console.log(`  卖家信息: ${product.profiles ? '存在' : '缺失'}`);
                        console.log(`  关键字段检查:`);
                        console.log(`    - title: ${product.title ? '✅' : '❌'}`);
                        console.log(`    - description: ${product.description ? '✅' : '❌'}`);
                        console.log(`    - price: ${product.price ? '✅' : '❌'}`);
                        console.log(`    - images: ${product.images ? '✅' : '❌'}`);
                        console.log(`    - profiles: ${product.profiles ? '✅' : '❌'}`);
                    }
                } else {
                    console.log(`  错误响应: ${newApiResponse.data}`);
                }
            } catch (error) {
                console.log(`  API调用失败: ${error.message}`);
            }
            
            // 2.2 测试原始API
            console.log('\n2.2 测试原始API (无profiles关联):');
            try {
                const originalApiResponse = await makeRequest(`/rest/v1/secondhand_items?id=eq.${firstItem.id}&select=*`);
                console.log(`  状态码: ${originalApiResponse.status}`);
                if (originalApiResponse.status === 200) {
                    const product = originalApiResponse.data[0];
                    console.log(`  商品标题: ${product.title}`);
                    console.log(`  profile_id: ${product.profile_id}`);
                }
            } catch (error) {
                console.log(`  API调用失败: ${error.message}`);
            }
            
        } else {
            console.log('❌ 没有找到商品数据');
        }
        
        console.log('\n🎉 调试完成！');
        
    } catch (error) {
        console.error('❌ 调试失败:', error.message);
    }
}

debugProductDetail();