// 测试小程序中的联系卖家功能
const https = require('https');

const supabaseUrl = 'https://zbhlrnecjmdpuaxvhneu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o';

// 模拟 supabase_config.js 中的 sendMessage 方法
class MockSupabaseAPI {
  static async sendMessage(itemId, senderId, receiverId, content, messageType = 'inquiry') {
    const messageData = {
      item_id: itemId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: content,
      message_type: messageType,
      is_read: false
    };
    
    console.log('📨 模拟发送消息数据:', messageData);
    
    const response = await makeRequest('/rest/v1/item_messages', 'POST', messageData);
    console.log('✅ 消息发送成功:', response);
    return response && response.length > 0 ? response[0] : response;
  }
  
  static async request(path, method = 'GET', body = null) {
    return makeRequest(path, method, body);
  }
}

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

// 模拟小程序中的联系卖家流程
async function testContactSellerFlow() {
  console.log('🛒 模拟小程序联系卖家流程测试...\n');
  
  try {
    // 1. 获取测试商品
    console.log('📦 获取测试商品...');
    const items = await makeRequest('/rest/v1/secondhand_items?select=id,title,profile_id&limit=1');
    
    if (!items || items.length === 0) {
      console.error('❌ 没有找到测试商品');
      return;
    }
    
    const product = items[0];
    console.log(`✅ 找到测试商品: ${product.title} (ID: ${product.id})`);
    console.log(`👤 卖家ID: ${product.profile_id}`);
    
    // 2. 获取买家信息
    console.log('\n👤 获取买家信息...');
    const profiles = await makeRequest('/rest/v1/profiles?select=id,nickname&limit=2');
    
    if (!profiles || profiles.length < 2) {
      console.error('❌ 用户配置文件不足');
      return;
    }
    
    const buyer = profiles[0];
    const seller = profiles.find(p => p.id !== buyer.id) || profiles[1];
    console.log(`✅ 买家: ${buyer.nickname || buyer.id}`);
    console.log(`✅ 卖家: ${seller.nickname || seller.id}`);
    
    // 3. 模拟用户输入留言
    const testMessage = '你好，这个商品还在吗？价格能便宜一些吗？';
    console.log(`\n💬 用户输入留言: "${testMessage}"`);
    
    // 4. 检查是否联系自己的商品
    if (product.profile_id === buyer.id) {
      console.log('❌ 不能联系自己的商品');
      return;
    }
    
    // 5. 模拟发送消息
    console.log('\n📨 开始发送消息...');
    
    try {
      const result = await MockSupabaseAPI.sendMessage(
        product.id,
        buyer.id,
        product.profile_id,
        testMessage,
        'inquiry'
      );
      
      if (result && result.id) {
        console.log('✅ 消息发送成功!');
        console.log('📝 消息ID:', result.id);
        console.log('🕒 发送时间:', result.created_at);
      } else {
        console.log('❌ 消息发送失败: 无效返回结果');
      }
      
    } catch (error) {
      console.error('❌ 消息发送失败:', error.message);
      return;
    }
    
    // 6. 更新商品咨询次数
    console.log('\n📊 更新商品咨询次数...');
    try {
      const updatedItem = await makeRequest(`/rest/v1/secondhand_items?id=eq.${product.id}`, 'PATCH', {
        inquiry_count: 1
      });
      console.log('✅ 商品咨询次数更新成功');
    } catch (error) {
      console.error('⚠️ 更新咨询次数失败:', error.message);
    }
    
    // 7. 验证消息是否保存
    console.log('\n🔍 验证消息是否保存...');
    try {
      const messages = await makeRequest(`/rest/v1/item_messages?item_id=eq.${product.id}&select=*&order=created_at.desc&limit=5`);
      if (messages && messages.length > 0) {
        console.log(`✅ 找到 ${messages.length} 条相关消息`);
        const latestMessage = messages[0];
        console.log('📝 最新消息内容:', latestMessage.content);
        console.log('👤 发送者ID:', latestMessage.sender_id);
        console.log('👥 接收者ID:', latestMessage.receiver_id);
      } else {
        console.log('❌ 没有找到相关消息');
      }
    } catch (error) {
      console.error('❌ 验证消息失败:', error.message);
    }
    
    console.log('\n🎉 联系卖家功能测试完成！');
    console.log('💡 小程序中的联系卖家功能应该可以正常使用了');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testContactSellerFlow().then(() => {
  console.log('\n🏁 测试完成');
}).catch(console.error);