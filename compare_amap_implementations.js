/**
 * 对比高德地图API的两种实现方式
 * 1. 自建HTTP请求实现 (amap_api.js)
 * 2. 官方SDK实现 (amap_sdk.js)
 */

console.log('🔍 对比高德地图API实现方式...\n');

const amapApi = require('./utils/amap_api.js');
const amapSDK = require('./utils/amap_sdk.js');

// 测试用的固定位置（上海人民广场）
const testLocation = {
  longitude: 121.4737,
  latitude: 31.2304
};

console.log('📍 测试位置: 上海人民广场');
console.log('🔍 搜索关键词: 母婴室\n');

// 对比测试函数
async function compareImplementations() {
  console.log('=== 🌐 自建HTTP请求实现测试 ===');
  
  try {
    const result1 = await amapApi.searchMaternalFacilities(testLocation, 'nursing_room', 2000);
    console.log('✅ 自建实现成功');
    console.log('📊 搜索结果数量:', result1.pois.length);
    if (result1.pois.length > 0) {
      console.log('📝 第一个结果:', {
        name: result1.pois[0].name,
        address: result1.pois[0].address,
        tel: result1.pois[0].tel
      });
    }
  } catch (error) {
    console.log('❌ 自建实现失败:', error.message);
  }

  console.log('\n=== 📱 官方SDK实现测试 ===');
  
  // 模拟微信小程序环境的基本wx对象
  global.wx = {
    getLocation: (options) => {
      // 模拟成功回调
      setTimeout(() => {
        options.success({
          longitude: testLocation.longitude,
          latitude: testLocation.latitude
        });
      }, 100);
    },
    setStorage: () => {},
    getStorage: () => {},
    request: (options) => {
      // 这里会失败，因为缺少真实的微信环境
      options.fail({ errMsg: '模拟环境不支持request' });
    }
  };

  try {
    const result2 = await amapSDK.searchMaternalFacilities(testLocation, 'nursing_room', 2000);
    console.log('✅ 官方SDK实现成功');
    console.log('📊 搜索结果数量:', result2.pois.length);
    if (result2.pois.length > 0) {
      console.log('📝 第一个结果:', {
        name: result2.pois[0].name,
        address: result2.pois[0].address
      });
    }
  } catch (error) {
    console.log('❌ 官方SDK实现失败:', error.message);
  }

  console.log('\n=== 📋 实现对比分析 ===');
  console.log('');
  console.log('🌐 自建HTTP实现 (amap_api.js):');
  console.log('✅ 优点:');
  console.log('  - 灵活性高，可以自定义请求参数');
  console.log('  - 错误处理可控');
  console.log('  - 不依赖特定环境');
  console.log('  - 已在你的项目中正常工作');
  console.log('❌ 缺点:');
  console.log('  - 需要自己封装API接口');
  console.log('  - 需要处理更复杂的错误码');
  console.log('');
  
  console.log('📱 官方SDK实现 (amap_sdk.js):');
  console.log('✅ 优点:');
  console.log('  - 官方维护，功能完整');
  console.log('  - 接口设计更简洁');
  console.log('  - 专门针对微信小程序优化');
  console.log('  - 包含更多高级功能');
  console.log('❌ 缺点:');
  console.log('  - 依赖微信小程序环境');
  console.log('  - 在Node.js环境下无法测试');
  console.log('  - 代码压缩不易调试');
  console.log('');

  console.log('💡 建议:');
  console.log('🎯 继续使用现有的自建实现 (amap_api.js)，因为:');
  console.log('  1. 已经在你的项目中正常工作');
  console.log('  2. 错误处理机制完善');
  console.log('  3. 可以灵活扩展功能');
  console.log('  4. 不依赖特定的运行环境');
  console.log('');
  console.log('🔄 如果需要升级，可以考虑:');
  console.log('  - 保留现有实现作为备选');
  console.log('  - 在真实微信环境中测试SDK');
  console.log('  - 逐步迁移到SDK实现');
}

// 运行对比测试
compareImplementations().catch(console.error);

module.exports = {
  amapApi,
  amapSDK,
  testLocation
};