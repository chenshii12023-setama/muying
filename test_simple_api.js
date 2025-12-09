// 简单API测试 - 不依赖微信小程序环境
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

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    console.log(`✅ ${method} ${path} - Status: ${res.statusCode}`);
                    resolve({ status: res.statusCode, data: result });
                } catch (e) {
                    console.log(`📄 ${method} ${path} - Status: ${res.statusCode} - Raw: ${body}`);
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ ${method} ${path} - Error: ${error.message}`);
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testAPI() {
    console.log('🚀 开始测试 Supabase API...');
    
    try {
        // 1. 测试连接
        console.log('\n📍 1. 测试数据库连接...');
        const connectionTest = await makeRequest('/rest/v1/secondhand_items?limit=1');
        
        // 2. 测试获取用户
        console.log('\n📍 2. 测试获取用户资料...');
        const profilesTest = await makeRequest('/rest/v1/profiles?select=*');
        
        // 3. 测试获取商品
        console.log('\n📍 3. 测试获取商品列表...');
        const itemsTest = await makeRequest('/rest/v1/secondhand_items?select=*,profiles(nickname)&status=eq.available');
        
        // 4. 测试创建商品
        console.log('\n📍 4. 测试创建商品...');
        const newItem = {
            title: '测试商品API',
            description: '通过API创建的测试商品',
            price: 99.99,
            category: 'toy',
            category_name: '玩具',
            condition: 'good',
            location: '测试城市',
            profile_id: '123e4567-e89b-12d3-a456-426614174000',
            user_id: 'api_test_user'
        };
        const createTest = await makeRequest('/rest/v1/secondhand_items', 'POST', newItem);
        
        console.log('\n🎉 API测试完成！');
        console.log('📊 结果汇总:');
        console.log(`- 连接测试: ${connectionTest.status}`);
        console.log(`- 用户资料: ${profilesTest.status} (数量: ${Array.isArray(profilesTest.data) ? profilesTest.data.length : 'N/A'})`);
        console.log(`- 商品列表: ${itemsTest.status} (数量: ${Array.isArray(itemsTest.data) ? itemsTest.data.length : 'N/A'})`);
        console.log(`- 创建商品: ${createTest.status}`);
        
        if (createTest.status === 201) {
            console.log('✅ 商品创建成功！数据正在写入数据库。');
        } else {
            console.log('❌ 商品创建失败，需要检查权限设置。');
        }
        
    } catch (error) {
        console.error('❌ API测试失败:', error.message);
    }
}

testAPI();