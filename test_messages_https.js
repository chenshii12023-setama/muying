const https = require('https');

const supabaseUrl = 'https://bjqxrtopljgqgdqbxwmu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcXhydG9wbGpncWdkcWJ4d211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzOTcwNDgsImV4cCI6MjA1MTk3MzA0OH0.gQ6kTfgPpOKjZKSsRWBodml-1WGRhNYFqZh3CwH3p8o';

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

async function testConnection() {
  console.log('🔌 测试 Supabase 连接...');
  try {
    // 测试基本连接
    await makeRequest('/rest/v1/?select=count');
    console.log('✅ Supabase 连接正常');
    return true;
  } catch (error) {
    console.error('❌ Supabase 连接失败:', error.message);
    return false;
  }
}

async function checkTable(tableName) {
  console.log(`📋 检查表 ${tableName}...`);
  try {
    const data = await makeRequest(`/rest/v1/${tableName}?select=count&limit=1`);
    console.log(`✅ 表 ${tableName} 存在`);
    return true;
  } catch (error) {
    console.error(`❌ 表 ${tableName} 不存在或无权限:`, error.message);
    return false;
  }
}

async function testSendMessage() {
  console.log('🧪 测试消息功能...\n');
  
  // 1. 测试连接
  const connected = await testConnection();
  if (!connected) {
    console.log('💡 请检查网络连接和 Supabase 配置');
    return;
  }
  
  // 2. 检查表
  const tablesExist = await Promise.all([
    checkTable('profiles'),
    checkTable('secondhand_items'),
    checkTable('item_messages')
  ]);
  
  if (!tablesExist[2]) {
    console.log('\n💡 请在 Supabase Dashboard 执行 complete_message_fix.sql 脚本');
    return;
  }
  
  try {
    // 3. 获取测试数据
    console.log('\n📦 获取测试商品...');
    const items = await makeRequest('/rest/v1/secondhand_items?select=id,title&limit=1');
    
    if (!items || items.length === 0) {
      console.error('❌ 没有找到测试商品，请先添加一些商品');
      return;
    }
    
    const testItem = items[0];
    console.log(`✅ 找到测试商品: ${testItem.title} (ID: ${testItem.id})`);
    
    // 4. 获取用户配置
    console.log('👤 获取用户配置...');
    const profiles = await makeRequest('/rest/v1/profiles?select=id,nickname&limit=2');
    
    if (!profiles || profiles.length < 2) {
      console.error('❌ 用户配置文件不足，至少需要2个用户');
      return;
    }
    
    const sender = profiles[0];
    const receiver = profiles[1];
    console.log(`✅ 找到测试用户 - 发送者: ${sender.nickname || sender.id}, 接收者: ${receiver.nickname || receiver.id}`);
    
    // 5. 测试发送消息
    console.log('📨 测试发送消息...');
    const testMessage = {
      item_id: testItem.id,
      sender_id: sender.id,
      receiver_id: receiver.id,
      content: '这是一条测试消息 - ' + new Date().toLocaleTimeString(),
      message_type: 'inquiry',
      is_read: false
    };
    
    const sentMessage = await makeRequest('/rest/v1/item_messages', 'POST', testMessage);
    
    console.log('✅ 消息发送成功!');
    console.log('消息ID:', sentMessage[0]?.id);
    console.log('消息内容:', sentMessage[0]?.content);
    
    // 6. 验证消息
    console.log('\n🔍 验证消息是否保存...');
    const verifyMessage = await makeRequest(`/rest/v1/item_messages?id=eq.${sentMessage[0]?.id}&select=*`);
    
    if (verifyMessage && verifyMessage.length > 0) {
      console.log('✅ 消息验证成功，已保存到数据库');
      console.log('创建时间:', verifyMessage[0].created_at);
    } else {
      console.log('❌ 消息验证失败');
    }
    
    console.log('\n🎉 消息功能测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testSendMessage().then(() => {
  console.log('\n🏁 测试完成');
}).catch(console.error);