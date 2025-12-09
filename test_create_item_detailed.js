// 详细测试创建商品 - 查看具体错误
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
                    resolve({ status: res.statusCode, data: result, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testCreateItem() {
    console.log('🔍 详细测试创建商品...');
    
    try {
        // 1. 先获取一个有效的profile_id
        console.log('📍 获取用户资料...');
        const profilesResponse = await makeRequest('/rest/v1/profiles?limit=1&select=*');
        console.log('用户资料:', JSON.stringify(profilesResponse.data, null, 2));
        
        if (profilesResponse.status === 200 && profilesResponse.data.length > 0) {
            const profile = profilesResponse.data[0];
            console.log(`✅ 使用用户资料: ${profile.nickname} (ID: ${profile.id})`);
            
            // 2. 测试创建商品 - 使用最简字段
            console.log('\n📍 测试创建商品（最简版本）...');
            const minimalItem = {
                title: '最简测试商品',
                description: '测试描述',
                price: 10.00,
                category: 'toy',
                condition: 'good',
                location: '测试地点',
                profile_id: profile.id
            };
            
            const createResponse = await makeRequest('/rest/v1/secondhand_items', 'POST', minimalItem);
            
            console.log(`创建状态: ${createResponse.status}`);
            console.log('创建响应:', JSON.stringify(createResponse.data, null, 2));
            
            if (createResponse.status === 201) {
                console.log('✅ 商品创建成功！');
            } else {
                console.log('❌ 商品创建失败，分析原因...');
                console.log('响应头:', JSON.stringify(createResponse.headers, null, 2));
            }
        } else {
            console.log('❌ 没有找到用户资料，需要先创建用户');
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testCreateItem();