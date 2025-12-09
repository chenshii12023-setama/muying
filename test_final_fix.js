// 测试最终修复 - 商品详情和收藏功能
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

async function testFinalFix() {
    console.log('🔍 测试最终修复...\n');
    
    try {
        // 1. 测试商品列表查询
        console.log('📍 1. 测试商品列表查询...');
        const itemsResponse = await makeRequest('/rest/v1/secondhand_items?select=*,profiles(nickname,avatar_url)&status=eq.available&order=created_at.desc');
        console.log(`状态码: ${itemsResponse.status}`);
        
        if (itemsResponse.status === 200 && itemsResponse.data.length > 0) {
            console.log(`✅ 找到 ${itemsResponse.data.length} 个商品`);
            const firstItem = itemsResponse.data[0];
            console.log(`第一个商品: ${firstItem.title} (ID: ${firstItem.id})`);
            
            // 2. 测试根据ID查询商品详情
            console.log('\n📍 2. 测试商品详情查询...');
            const detailResponse = await makeRequest(`/rest/v1/secondhand_items?id=eq.${firstItem.id}&select=*,profiles(nickname,avatar_url)`);
            console.log(`详情查询状态码: ${detailResponse.status}`);
            
            if (detailResponse.status === 200 && detailResponse.data.length > 0) {
                console.log('✅ 商品详情查询成功');
                const detail = detailResponse.data[0];
                console.log(`商品: ${detail.title}`);
                console.log(`卖家: ${detail.profiles?.nickname || '未知'}`);
            } else {
                console.log('❌ 商品详情查询失败');
            }
            
            // 3. 测试收藏功能
            console.log('\n📍 3. 测试收藏功能...');
            const profileId = firstItem.profile_id;
            
            // 检查现有收藏
            const favoritesResponse = await makeRequest(`/rest/v1/item_favorites?profile_id=eq.${profileId}&select=item_id`);
            console.log(`收藏查询状态码: ${favoritesResponse.status}`);
            
            if (favoritesResponse.status === 200) {
                console.log('✅ 收藏功能正常');
                console.log(`当前收藏数量: ${favoritesResponse.data.length}`);
                
                // 测试添加收藏
                if (favoritesResponse.data.length === 0) {
                    console.log('尝试添加收藏...');
                    const addResponse = await makeRequest(`/rest/v1/item_favorites`, 'POST', {
                        item_id: firstItem.id,
                        profile_id: profileId
                    });
                    console.log(`添加收藏状态码: ${addResponse.status}`);
                    
                    if (addResponse.status === 201) {
                        console.log('✅ 添加收藏成功');
                    }
                }
            } else {
                console.log('❌ 收藏功能异常');
            }
            
        } else {
            console.log('❌ 没有找到商品');
        }
        
        console.log('\n🎉 测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testFinalFix();