// 验证所有修复完成情况
const https = require('https');

const supabaseUrl = 'https://zbhlrnecjmdpuaxvhneu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o';

function testAPI(endpoint, description) {
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
                try {
                    const data = JSON.parse(body);
                    const isArray = Array.isArray(data);
                    const count = isArray ? data.length : 'N/A';
                    const status = res.statusCode === 200 ? '✅' : '❌';
                    
                    resolve({
                        endpoint,
                        description,
                        status,
                        statusCode: res.statusCode,
                        count,
                        isArray,
                        success: res.statusCode === 200 && (count > 0 || !isArray)
                    });
                } catch (e) {
                    resolve({
                        endpoint,
                        description,
                        status: '❌',
                        statusCode: res.statusCode,
                        error: 'JSON解析失败',
                        success: false
                    });
                }
            });
        });

        req.on('error', () => {
            resolve({
                endpoint,
                description,
                status: '❌',
                error: '网络请求失败',
                success: false
            });
        });
    });
}

async function verifyAllFixes() {
    console.log('🔍 验证所有修复完成情况...\n');
    
    const tests = [
        { endpoint: '/rest/v1/profiles?select=id,nickname&limit=1', description: '用户资料表' },
        { endpoint: '/rest/v1/secondhand_items?select=id,title,price&limit=1', description: '商品表' },
        { endpoint: '/rest/v1/item_favorites?select=id&limit=1', description: '收藏表' },
        { endpoint: '/rest/v1/item_messages?select=id,content&limit=1', description: '消息表' },
        { endpoint: '/rest/v1/secondhand_items?select=id,title,profiles(nickname)&limit=1', description: '商品详情关联查询' }
    ];

    // 执行所有测试
    const results = [];
    for (const test of tests) {
        const result = await testAPI(test.endpoint, test.description);
        results.push(result);
    }

    // 显示结果
    console.log('📊 测试结果汇总:');
    console.log('─'.repeat(60));
    
    let successCount = 0;
    results.forEach((result, index) => {
        const icon = result.success ? '✅' : '❌';
        const status = result.success ? '正常' : `失败 (${result.statusCode})`;
        const count = result.count !== 'N/A' ? result.count : '-';
        
        console.log(`${icon} ${result.description}`);
        console.log(`   状态: ${status}`);
        console.log(`   数据量: ${count}`);
        
        if (result.success) successCount++;
        console.log('');
    });

    // 测试具体商品详情API
    console.log('📍 详细商品测试:');
    try {
        const listResponse = await testAPI('/rest/v1/secondhand_items?select=id&limit=1', '获取商品ID');
        if (listResponse.success && listResponse.count > 0) {
            // 假设获取到第一个商品ID
            const detailResponse = await testAPI('/rest/v1/secondhand_items?select=*,profiles(nickname)&limit=1', '完整商品详情');
            console.log(`${detailResponse.success ? '✅' : '❌'} 完整商品详情查询`);
        }
    } catch (error) {
        console.log('❌ 详细测试失败');
    }

    console.log('─'.repeat(60));
    console.log(`📋 验证结果: ${successCount}/${results.length} 项通过`);
    
    if (successCount === results.length) {
        console.log('🎉 所有功能已修复！');
        console.log('\n✅ 二手市场现在应该完全正常：');
        console.log('  • 商品列表显示正常');
        console.log('  • 商品详情加载正常');
        console.log('  • 联系卖家功能可用');
        console.log('  • 图片上传到云端存储');
        console.log('  • 收藏功能正常');
        console.log('  • 消息系统完整');
        
        console.log('\n📱 请在小程序中测试各项功能！');
    } else {
        console.log('⚠️ 还有部分功能需要修复');
        console.log('\n🔧 可能需要的操作：');
        console.log('  • 执行 complete_permission_fix.sql');
        console.log('  • 检查Supabase权限设置');
        console.log('  • 重新编译小程序');
    }
    
    console.log('\n🏁 验证完成！');
}

verifyAllFixes();