/**
 * 高德地图配置文件
 */

// 高德地图API密钥
const AMAP_WEB_API_KEY = '3a7f45b132f4f120dc009e9c9626bac5'

// 高德地图服务配置
const AMAP_CONFIG = {
  // Web服务API密钥
  key: AMAP_WEB_API_KEY,
  
  // 基础URL
  baseUrl: 'https://restapi.amap.com',
  
  // 搜索配置
  search: {
    // 周边搜索URL
    nearby: '/v3/place/around',
    // 文本搜索URL  
    text: '/v3/place/text',
    // 关键词搜索URL
    keywords: '/v3/place/around'
  },
  
  // 地理编码配置
  geocode: {
    // 地理编码URL
    url: '/v3/geocode/geo',
    // 逆地理编码URL
    regeo: '/v3/geocode/regeo'
  },
  
  // 路径规划配置
  direction: {
    // 步行路径规划URL
    walking: '/v3/direction/walking',
    // 驾车路径规划URL
    driving: '/v3/direction/driving',
    // 公交路径规划URL
    transit: '/v3/direction/transit/integrated'
  },
  
  // 天气查询配置
  weather: {
    // 天气查询URL
    url: '/v3/weather/weatherInfo'
  },
  
  // 默认城市
  defaultCity: '全国',
  
  // 默认搜索半径（米）
  defaultRadius: 5000,
  
  // 母婴设施类型关键词
  facilityKeywords: {
    nursing_room: '母婴室',
    playground: '儿童乐园,游乐场,亲子乐园',
    hospital: '妇幼保健院,儿科医院,儿童医院',
    shopping: '母婴店,童装店,玩具店',
    restaurant: '亲子餐厅,儿童餐厅'
  }
}

/**
 * 验证高德地图配置
 */
const validateConfig = () => {
  const errors = []
  
  if (!AMAP_WEB_API_KEY) {
    errors.push('缺少高德地图API密钥')
  }
  
  if (AMAP_WEB_API_KEY === 'your_amap_key_here') {
    errors.push('请配置真实的高德地图API密钥')
  }
  
  if (errors.length > 0) {
    console.warn('高德地图配置问题:', errors.join('; '))
    return false
  }
  
  return true
}

module.exports = {
  AMAP_CONFIG,
  AMAP_WEB_API_KEY,
  validateConfig
}