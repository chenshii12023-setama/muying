/**
 * 测试高德地图官方SDK
 */

// 引入高德地图SDK
const { AMapWX } = require('./lib/amap-wx.130.js');

// 你的高德地图Key
const AMAP_KEY = '3a7f45b132f4f120dc009e9c9626bac5';

console.log('🗺️ 开始测试高德地图官方SDK...');

// 创建高德地图SDK实例
const amap = new AMapWX({
  key: AMAP_KEY
});

console.log('✅ 高德地图SDK实例创建成功');
console.log('🔑 使用API Key:', AMAP_KEY);

// 测试获取当前位置
amap.getWxLocation({
  success: function(location) {
    console.log('📍 获取位置成功:', location);
    
    // 测试周边搜索
    amap.getPoiAround({
      location: location,
      querykeywords: '母婴室',
      querytypes: '服务设施',
      success: function(result) {
        console.log('🔍 周边搜索成功:', result.pois.length, '个结果');
        
        if (result.pois && result.pois.length > 0) {
          console.log('📋 第一个POI信息:', {
            name: result.pois[0].name,
            address: result.pois[0].address,
            location: result.pois[0].location
          });
        }
      },
      fail: function(error) {
        console.error('❌ 周边搜索失败:', error);
      }
    });
  },
  fail: function(error) {
    console.error('❌ 获取位置失败:', error);
  }
});

// 测试逆地理编码
amap.getRegeo({
  location: '121.4737,31.2304', // 上海
  success: function(result) {
    console.log('🏠 逆地理编码成功:', result);
  },
  fail: function(error) {
    console.error('❌ 逆地理编码失败:', error);
  }
});

console.log('🎯 高德地图SDK测试完成！');
console.log('');
console.log('📋 SDK支持的功能:');
console.log('✅ getWxLocation - 获取当前位置');
console.log('✅ getPoiAround - 周边POI搜索');
console.log('✅ getRegeo - 逆地理编码');
console.log('✅ getGeo - 地理编码');
console.log('✅ getWeather - 天气查询');
console.log('✅ getDrivingRoute - 驾车路径规划');
console.log('✅ getWalkingRoute - 步行路径规划');
console.log('✅ getTransitRoute - 公交路径规划');
console.log('✅ getInputtips - 输入提示');
console.log('✅ getStaticmap - 静态地图');

module.exports = {
  AMapWX,
  amap
};