/**
 * 高德地图官方SDK适配器
 * 封装高德地图官方SDK，提供统一的接口
 */

// 引入高德地图官方SDK
const { AMapWX } = require('../lib/amap-wx.130.js');
const { AMAP_WEB_API_KEY } = require('./amap_config.js');

/**
 * 高德地图SDK服务类
 */
class AmapSDKService {
  constructor() {
    // 初始化高德地图SDK
    this.amap = new AMapWX({
      key: AMAP_WEB_API_KEY
    });
    
    console.log('🗺️ 高德地图SDK初始化成功');
    console.log('🔑 API Key:', AMAP_WEB_API_KEY);
  }

  /**
   * 获取当前位置
   */
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      this.amap.getWxLocation({
        success: (location) => {
          const [longitude, latitude] = location.split(',');
          resolve({
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude),
            location: location
          });
        },
        fail: (error) => {
          reject(new Error(`获取位置失败: ${error.errMsg || '未知错误'}`));
        }
      });
    });
  }

  /**
   * 逆地理编码
   */
  async reverseGeocode(longitude, latitude) {
    return new Promise((resolve, reject) => {
      this.amap.getRegeo({
        location: `${longitude},${latitude}`,
        iconPath: '/images/location-marker.png',
        iconWidth: 22,
        iconHeight: 32,
        success: (result) => {
          if (result && result.length > 0) {
            resolve({
              address: result[0].name,
              desc: result[0].desc,
              regeocodeData: result[0].regeocodeData
            });
          } else {
            reject(new Error('逆地理编码失败：未找到地址信息'));
          }
        },
        fail: (error) => {
          reject(new Error(`逆地理编码失败: ${error.errMsg || '未知错误'}`));
        }
      });
    });
  }

  /**
   * 周边POI搜索
   */
  async searchNearby(longitude, latitude, keywords, radius = 5000) {
    return new Promise((resolve, reject) => {
      this.amap.getPoiAround({
        location: `${longitude},${latitude}`,
        querykeywords: keywords,
        querytypes: '服务设施',
        iconPath: '/images/poi-marker.png',
        iconPathSelected: '/images/poi-marker-selected.png',
        success: (result) => {
          resolve({
            pois: result.pois || [],
            markers: result.markers || [],
            count: result.pois ? result.pois.length : 0
          });
        },
        fail: (error) => {
          reject(new Error(`周边搜索失败: ${error.errMsg || '未知错误'}`));
        }
      });
    });
  }

  /**
   * 搜索母婴设施
   */
  async searchMaternalFacilities(location, facilityType, radius = 5000) {
    const keywordsMap = {
      'nursing_room': '母婴室',
      'playground': '儿童乐园,游乐场,亲子乐园',
      'hospital': '妇幼保健院,儿科医院,儿童医院',
      'shopping': '母婴店,童装店,玩具店',
      'restaurant': '亲子餐厅,儿童餐厅'
    };

    const keywords = keywordsMap[facilityType] || facilityType;
    return await this.searchNearby(location.longitude, location.latitude, keywords, radius);
  }

  /**
   * 步行路径规划
   */
  async planWalkingRoute(origin, destination) {
    return new Promise((resolve, reject) => {
      const originStr = `${origin.longitude},${origin.latitude}`;
      const destStr = `${destination.longitude},${destination.latitude}`;
      
      this.amap.getWalkingRoute({
        origin: originStr,
        destination: destStr,
        success: (result) => {
          if (result.paths && result.paths.length > 0) {
            const route = result.paths[0];
            resolve({
              paths: result.paths,
              distance: route.distance,
              duration: route.duration,
              steps: route.steps || []
            });
          } else {
            reject(new Error('未找到步行路线'));
          }
        },
        fail: (error) => {
          reject(new Error(`路径规划失败: ${error.errMsg || '未知错误'}`));
        }
      });
    });
  }

  /**
   * 地理编码（地址转坐标）
   */
  async geocode(address, city = '') {
    return new Promise((resolve, reject) => {
      this.amap.getGeo({
        options: {
          address: address,
          city: city
        },
        success: (result) => {
          if (result.geocodes && result.geocodes.length > 0) {
            const geo = result.geocodes[0];
            resolve({
              address: geo.formatted_address,
              location: geo.location,
              level: geo.level,
              adcode: geo.adcode
            });
          } else {
            reject(new Error('地理编码失败：未找到坐标信息'));
          }
        },
        fail: (error) => {
          reject(new Error(`地理编码失败: ${error.errMsg || '未知错误'}`));
        }
      });
    });
  }

  /**
   * 天气查询
   */
  async getWeather(city = '') {
    return new Promise((resolve, reject) => {
      this.amap.getWeather({
        city: city,
        success: (result) => {
          resolve(result);
        },
        fail: (error) => {
          reject(new Error(`天气查询失败: ${error.errMsg || '未知错误'}`));
        }
      });
    });
  }

  /**
   * 输入提示（搜索建议）
   */
  async getInputtips(keywords, city = '', location = '') {
    return new Promise((resolve, reject) => {
      this.amap.getInputtips({
        keywords: keywords,
        city: city,
        location: location,
        success: (result) => {
          resolve(result.tips || []);
        },
        fail: (error) => {
          reject(new Error(`输入提示失败: ${error.errMsg || '未知错误'}`));
        }
      });
    });
  }
}

// 创建单例实例
const amapSDKService = new AmapSDKService();

module.exports = amapSDKService;