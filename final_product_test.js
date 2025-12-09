// 最终商品详情测试
const https = require('https');

const supabaseUrl = 'https://zbhlrnecjmdpuaxvhneu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o';

function testProductDetail() {
    return new Promise((resolve) => {
        // 1. 先获取商品列表
        const listUrl = `${supabaseUrl}/rest/v1/secondhand_items?select=id,title&limit=3`;
        const options = {
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            }
        };

        const listReq = https.get(listUrl, options, (listRes) => {
            let body = '';
            listRes.on('data', (chunk) => body += chunk);
            listRes.on('end', () => {
                try {
                    const items = JSON.parse(body);
                    if (listRes.statusCode === 200 && items.length > 0) {
                        const item = items[0];
                        console.log(`📦 测试商品: ${item.title} (ID: ${item.id})`);
                        
                        // 2. 测试商品详情API
                        const detailUrl = `${supabaseUrl}/rest/v1/secondhand_items?id=eq.${item.id}&select=*,profiles(nickname,avatar_url)`;
                        const detailReq = https.get(detailUrl, options, (detailRes) => {
                            let detailBody = '';
                            detailRes.on('data', (chunk) => detailBody += chunk);
                            detailRes.on('end', () => {
                                console.log(`\n🔍 商品详情API测试结果:`);
                                console.log(`状态码: ${detailRes.statusCode}`);
                                
                                try {
                                    const detailData = JSON.parse(detailBody);
                                    
                                    if (detailRes.statusCode === 200 && detailData.length > 0) {
                                        const product = detailData[0];
                                        console.log('✅ 商品详情加载成功');
                                        console.log(`📝 标题: ${product.title}`);
                                        console.log(`💰 价格: ¥${product.price}`);
                                        console.log(`📍 地点: ${product.location}`);
                                        console.log(`👤 卖家: ${product.profiles?.nickname || '未知'}`);
                                        console.log(`🖼️ 图片: ${product.images ? '有' : '无'} (${Array.isArray(product.images) ? product.images.length : 0}张)`);
                                        console.log(`📅 发布: ${product.created_at?.split('T')[0] || '未知'}`);
                                        
                                        console.log('\n🎉 关键字段检查:');
                                        console.log(`✅ title: ${product.title ? '存在' : '缺失'}`);
                                        console.log(`✅ price: ${product.price ? '存在' : '缺失'}`);
                                        console.log(`✅ description: ${product.description ? '存在' : '缺失'}`);
                                        console.log(`✅ location: ${product.location ? '存在' : '缺失'}`);
                                        console.log(`✅ profiles: ${product.profiles ? '存在' : '缺失'}`);
                                        console.log(`✅ images: ${product.images ? '存在' : '缺失'}`);
                                        
                                        console.log('\n📱 小程序中应该能正常显示商品详情');
                                        
                                    } else {
                                        console.log('❌ 商品详情加载失败');
                                        console.log('响应:', detailBody);
                                    }
                                } catch (e) {
                                    console.log('❌ 解析失败:', detailBody);
                                }
                                resolve();
                            });
                        });
                        
                        detailReq.on('error', (error) => {
                            console.log('❌ 详情请求失败:', error.message);
                            resolve();
                        });
                        
                    } else {
                        console.log('❌ 没有找到商品数据');
                        resolve();
                    }
                } catch (e) {
                    console.log('❌ 解析商品列表失败:', body);
                    resolve();
                }
            });
        });
        
        listReq.on('error', (error) => {
            console.log('❌ 列表请求失败:', error.message);
            resolve();
        });
    });
}

testProductDetail().then(() => {
    console.log('\n🏁 测试完成！');
    console.log('\n📋 如果所有检查都显示✅，商品详情应该能正常加载');
});