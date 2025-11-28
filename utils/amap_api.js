/**
 * 高德地图API服务封装
 */

const { AMAP_CONFIG } = require('./amap_config.js')

/**
 * 高德地图API服务类
 */
class AmapApi {
  constructor() {
    this.key = AMAP_CONFIG.key
    this.baseUrl = AMAP_CONFIG.baseUrl
  }

  /**
   * 发起HTTP请求
   */
  async request(url, params = {}) {
    // 添加API密钥和其他必要参数到请求中
    const requestParams = {
      ...params,
      key: this.key,
      output: 'json',
      extensions: 'all'
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseUrl}${url}`,
        data: requestParams,
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.status === '1') {
              resolve(res.data)
            } else {
              // 处理高德地图API特定的错误码
              const errorMsg = this.getAmapErrorMessage(res.data.info, res.data.infocode)
              reject(new Error(errorMsg))
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.data.message || '请求失败'}`))
          }
        },
        fail: (err) => {
          reject(new Error(`网络请求失败: ${err.errMsg}`))
        }
      })
    })
  }

  /**
   * 获取高德地图API错误信息的友好描述
   */
  getAmapErrorMessage(info, infocode) {
    const errorMap = {
      'USERKEY_PLAT_NOMATCH': 'API密钥平台不匹配，请检查密钥配置',
      'USERKEY_RECYCLED': 'API密钥已被回收',
      'USERKEY_EXPIRED': 'API密钥已过期',
      'USERKEY_IP_REFUSED': 'API密钥IP白名单限制',
      'USERKEY_DOMAIN_REFUSED': 'API密钥域名白名单限制',
      'INVALID_USER_KEY': '无效的API密钥',
      'INSUFFICIENT_PRIVILEGES': 'API密钥权限不足',
      'INVALID_PARAMS': '请求参数错误',
      'OUT_OF_SERVICE': '服务暂停',
      'OVER_QUOTA': 'API调用次数超限',
      'TOO_FREQUENT_REQ': '请求频率过高'
    }

    if (errorMap[infocode]) {
      return errorMap[infocode]
    }

    // 如果不在常见错误码中，返回原始信息
    return info || `高德地图API错误: ${infocode}`
  }

  /**
   * 获取当前位置
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        altitude: false,
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy
          })
        },
        fail: (err) => {
          reject(new Error(`获取位置失败: ${err.errMsg}`))
        }
      })
    })
  }

  /**
   * 逆地理编码 - 将经纬度转换为地址信息
   */
  async reverseGeocode(location) {
    try {
      const result = await this.request(AMAP_CONFIG.geocode.regeo, {
        location: `${location.longitude},${location.latitude}`,
        radius: 1000,
        extensions: 'all'
      })
      
      return {
        address: result.regeocode.formatted_address,
        addressComponent: result.regeocode.addressComponent,
        pois: result.regeocode.pois || []
      }
    } catch (error) {
      throw new Error(`逆地理编码失败: ${error.message}`)
    }
  }

  /**
   * 周边搜索
   */
  async searchNearby(location, keywords, radius = AMAP_CONFIG.defaultRadius) {
    try {
      const result = await this.request(AMAP_CONFIG.search.nearby, {
        location: `${location.longitude},${location.latitude}`,
        keywords: keywords,
        radius: radius,
        types: '',
        sortrule: 'distance',
        page: 1,
        offset: 20
      })

      return {
        pois: result.pois || [],
        info: result.info,
        count: result.count
      }
    } catch (error) {
      throw new Error(`周边搜索失败: ${error.message}`)
    }
  }

  /**
   * 搜索母婴设施
   */
  async searchMaternalFacilities(location, facilityType, radius = 5000) {
    const keywords = AMAP_CONFIG.facilityKeywords[facilityType] || facilityType
    return await this.searchNearby(location, keywords, radius)
  }

  /**
   * 步行路径规划
   */
  async planWalkingRoute(origin, destination) {
    try {
      const result = await this.request(AMAP_CONFIG.direction.walking, {
        origin: `${origin.longitude},${origin.latitude}`,
        destination: `${destination.longitude},${destination.latitude}`
      })

      return {
        routes: result.route?.paths || [],
        info: result.info
      }
    } catch (error) {
      throw new Error(`路径规划失败: ${error.message}`)
    }
  }

  /**
   * 获取POI详细信息
   */
  async getPOIDetail(poiId) {
    try {
      const result = await this.request('/v3/place/detail', {
        id: poiId,
        extensions: 'all'
      })

      return result.pois ? result.pois[0] : null
    } catch (error) {
      throw new Error(`获取POI详情失败: ${error.message}`)
    }
  }

  /**
   * 获取天气信息
   */
  async getWeather(city = '') {
    try {
      const result = await this.request(AMAP_CONFIG.weather.url, {
        city: city || AMAP_CONFIG.defaultCity,
        extensions: 'all'
      })

      return {
        weather: result.lives ? result.lives[0] : null,
        forecasts: result.forecasts || []
      }
    } catch (error) {
      throw new Error(`获取天气信息失败: ${error.message}`)
    }
  }
}

// 创建单例实例
const amapApi = new AmapApi()

module.exports = amapApi