// 直接使用 HTTP 请求测试消息功能，避免依赖问题

const supabaseUrl = 'https://bjqxrtopljgqgdqbxwmu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcXhydG9wbGpncWdkcWJ4d211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzOTcwNDgsImV4cCI6MjA1MTk3MzA0OH0.gQ6kTfgPpOKjZKSsRWBodml-1WGRhNYFqZh3CwH3p8o';

// 简单的 HTTP 请求函数
function makeRequest(url, options = {}) {
  const defaultHeaders = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  
  return fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers }
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  });
}

async function checkTable(tableName) {
  console.log(`📋 检查表 ${tableName}...`);
  try {
    const data = await makeRequest(`${supabaseUrl}/rest/v1/${tableName}?select=count&limit=1`);
    console.log(`✅ 表 ${tableName} 存在`);
    return true;
  } catch (error) {
    console.error(`❌ 表 ${tableName} 不存在或无权限:`, error.message);
    return false;
  }
}

async function testSendMessage() {
  console.log('🧪 测试发送消息功能...\n');
  
  // 1. 检查必要的表
  const tablesExist = await Promise.all([
    checkTable('profiles'),
    checkTable('secondhand_items'),
    checkTable('item_messages')
  ]);
  
  if (!tablesExist[2]) {
    console.log('\n💡 item_messages 表不存在，请先在 Supabase Dashboard 执行以下 SQL:');
    console.log(`
-- 创建消息表
CREATE TABLE item_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'inquiry',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加外键约束
ALTER TABLE item_messages 
ADD CONSTRAINT fk_item_messages_item 
FOREIGN KEY (item_id) REFERENCES secondhand_items(id) ON DELETE CASCADE;

ALTER TABLE item_messages 
ADD CONSTRAINT fk_item_messages_sender 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE item_messages 
ADD CONSTRAINT fk_item_messages_receiver 
FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 授予权限
GRANT ALL ON item_messages TO anon;
GRANT ALL ON item_messages TO authenticated;
`);
    return;
  }
  
  try {
    // 2. 获取测试数据
    console.log('\n📦 获取测试商品...');
    const items = await makeRequest(`${supabaseUrl}/rest/v1/secondhand_items?select=id,title&limit=1`);
    
    if (!items || items.length === 0) {
      console.error('❌ 没有找到测试商品');
      return;
    }
    
    const testItem = items[0];
    console.log(`✅ 找到测试商品: ${testItem.title} (ID: ${testItem.id})`);
    
    // 3. 获取用户配置
    console.log('👤 获取用户配置...');
    const profiles = await makeRequest(`${supabaseUrl}/rest/v1/profiles?select=id&limit=2`);
    
    if (!profiles || profiles.length < 2) {
      console.error('❌ 用户配置文件不足，至少需要2个用户');
      return;
    }
    
    const sender = profiles[0];
    const receiver = profiles[1];
    console.log(`✅ 找到测试用户 - 发送者: ${sender.id}, 接收者: ${receiver.id}`);
    
    // 4. 测试发送消息
    console.log('📨 测试发送消息...');
    const testMessage = {
      item_id: testItem.id,
      sender_id: sender.id,
      receiver_id: receiver.id,
      content: '这是一条测试消息',
      message_type: 'inquiry',
      is_read: false
    };
    
    const sentMessage = await makeRequest(`${supabaseUrl}/rest/v1/item_messages`, {
      method: 'POST',
      body: JSON.stringify(testMessage)
    });
    
    console.log('✅ 消息发送成功!');
    console.log('消息ID:', sentMessage[0]?.id);
    console.log('消息内容:', sentMessage[0]);
    
    // 5. 验证消息
    console.log('\n🔍 验证消息是否保存...');
    const verifyMessage = await makeRequest(`${supabaseUrl}/rest/v1/item_messages?id=eq.${sentMessage[0]?.id}`);
    
    if (verifyMessage && verifyMessage.length > 0) {
      console.log('✅ 消息验证成功，已保存到数据库');
    } else {
      console.log('❌ 消息验证失败');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testSendMessage().then(() => {
  console.log('\n🏁 测试完成');
}).catch(console.error);