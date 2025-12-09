const { createClient } = require('@supabase/supabase-js');

// 从 supabase_config.js 读取配置
const supabaseUrl = 'https://bjqxrtopljgqgdqbxwmu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcXhydG9wbGpncWdkcWJ4d211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzOTcwNDgsImV4cCI6MjA1MTk3MzA0OH0.gQ6kTfgPpOKjZKSsRWBodml-1WGRhNYFqZh3CwH3p8o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSendMessage() {
  console.log('🧪 测试发送消息功能...');
  
  try {
    // 1. 检查 item_messages 表是否存在
    console.log('📋 检查 item_messages 表...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('item_messages')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ item_messages 表不存在或无权限:', tableError.message);
      console.log('💡 请在 Supabase Dashboard 的 SQL 编辑器中执行 simple_messages_fix.sql');
      return;
    } else {
      console.log('✅ item_messages 表存在');
    }
    
    // 2. 获取一个商品ID进行测试
    console.log('📦 获取测试商品...');
    const { data: items, error: itemError } = await supabase
      .from('secondhand_items')
      .select('id, title')
      .limit(1);
    
    if (itemError || !items || items.length === 0) {
      console.error('❌ 没有找到测试商品:', itemError?.message);
      return;
    }
    
    const testItem = items[0];
    console.log(`✅ 找到测试商品: ${testItem.title} (ID: ${testItem.id})`);
    
    // 3. 获取用户配置文件
    console.log('👤 获取用户配置文件...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(2);
    
    if (profileError || !profiles || profiles.length < 2) {
      console.error('❌ 用户配置文件不足:', profileError?.message);
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
    
    const { data: sentMessage, error: sendError } = await supabase
      .from('item_messages')
      .insert(testMessage)
      .select();
    
    if (sendError) {
      console.error('❌ 发送消息失败:', sendError.message);
      console.error('详细错误:', sendError);
    } else {
      console.log('✅ 消息发送成功!');
      console.log('消息内容:', sentMessage);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

async function checkAllTables() {
  console.log('🗃️ 检查所有相关表...');
  
  const tables = ['profiles', 'secondhand_items', 'item_messages'];
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);
      
      if (error) {
        console.error(`❌ 表 ${tableName} 不存在或无权限:`, error.message);
      } else {
        console.log(`✅ 表 ${tableName} 存在`);
      }
    } catch (err) {
      console.error(`❌ 检查表 ${tableName} 时出错:`, err.message);
    }
  }
}

// 运行测试
async function main() {
  console.log('🚀 开始消息功能测试...\n');
  
  await checkAllTables();
  console.log('\n' + '='.repeat(50) + '\n');
  await testSendMessage();
  
  console.log('\n🏁 测试完成');
}

main().catch(console.error);