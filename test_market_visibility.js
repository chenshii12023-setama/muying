// 测试商品在市场中的可见性
const https = require('https');

const supabaseUrl = 'https://zbhlrnecjmdpuaxvhneu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o';

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, supabaseUrl);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            }
        };

        const req = https.get(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve({ status: res.statusCode, data: result });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function testMarketVisibility() {
    console.log('🔍 测试商品在市场中的可见性...');
    
    try {
        const response = await makeRequest('/rest/v1/secondhand_items?select=*,profiles(nickname)&status=eq.available&order=created_at.desc');
        
        console.log(`📊 查询状态码: ${response.status}`);
        
        if (response.status === 200 && Array.isArray(response.data)) {
            console.log(`✅ 查询成功，共找到 ${response.data.length} 个商品`);
            
            if (response.data.length > 0) {
                console.log('\n📦 商品列表:');
                response.data.forEach((item, index) => {
                    console.log(`${index + 1}. ${item.title}`);
                    console.log(`   💰 价格: ¥${item.price}`);
                    console.log(`   📝 描述: ${item.description}`);
                    console.log(`   👤 卖家: ${item.profiles?.nickname || '未知用户'}`);
                    console.log(`   📅 创建时间: ${item.created_at}`);
                    console.log(`   🆔 商品ID: ${item.id}`);
                    console.log('---');
                });
                console.log('🎉 商品已成功保存到数据库，并且在市场中可见！');
            } else {
                console.log('⚠️ 没有找到商品，可能需要先上传商品');
            }
        } else {
            console.log('❌ 查询失败:', response.data);
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testMarketVisibility();