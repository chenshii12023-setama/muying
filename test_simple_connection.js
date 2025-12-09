// 简单连接测试 - 验证API可用性
const https = require('https');

const supabaseUrl = 'https://zbhlrnecjmdpuaxvhneu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o';

function testBasicAPI(endpoint, description) {
    return new Promise((resolve) => {
        const url = `${supabaseUrl}${endpoint}`;
        const options = {
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            }
        };

        const req = https.get(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                console.log(`${description}:`);
                console.log(`  状态码: ${res.statusCode}`);
                console.log(`  响应长度: ${body.length} 字符`);
                
                try {
                    const data = JSON.parse(body);
                    const isArray = Array.isArray(data);
                    const count = isArray ? data.length : 'N/A';
                    console.log(`  数据类型: ${isArray ? '数组' : '对象'}`);
                    console.log(`  数据量: ${count}`);
                    
                    if (res.statusCode === 200 && count > 0 && isArray) {
                        console.log(`  ✅ ${description} API正常`);
                    } else if (res.statusCode === 200 && !isArray && Object.keys(data).length > 0) {
                        console.log(`  ✅ ${description} API正常 (对象格式)`);
                    } else if (res.statusCode === 401) {
                        console.log(`  ❌ ${description} 认证失败 - 需要执行RLS修复脚本`);
                    } else {
                        console.log(`  ⚠️ ${description} API异常`);
                    }
                } catch (e) {
                    console.log(`  ❌ JSON解析失败: ${body.substring(0, 100)}...`);
                }
                console.log('---');
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`${description}: ❌ 网络错误 - ${error.message}`);
            resolve();
        });
    });
}

async function runTests() {
    console.log('🔍 开始API连接测试...\n');
    
    // 测试各个端点
    await testBasicAPI('/rest/v1/secondhand_items?limit=1', '商品列表');
    await testBasicAPI('/rest/v1/profiles?limit=1', '用户资料');
    await testBasicAPI('/rest/v1/item_favorites?limit=1', '收藏功能');
    await testBasicAPI('/rest/v1/item_messages?limit=1', '消息功能');
    
    console.log('\n🎯 如果看到401认证错误，请执行以下步骤：');
    console.log('1. 在Supabase Dashboard打开SQL编辑器');
    console.log('2. 执行 emergency_rls_fix.sql 脚本');
    console.log('3. 等待权限生效后重试');
    
    console.log('\n🎉 测试完成！');
}

runTests();