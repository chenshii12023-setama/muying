/**
 * Supabase 配置文件
 * 宝妈育儿轻指南小程序后端集成
 * 适配小程序环境，使用 wx.request 代替 Supabase JS 客户端
 * 包含本地存储降级机制
 */

const APIUtils = require('./utils/api.js')
const LocalStorageAPI = require('./utils/local-storage.js')

// Supabase 配置 - 直接使用配置文件中的值
let supabaseUrl = 'https://zbhlrnecjmdpuaxvhneu.supabase.co'
let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o'

// 在小程序环境中直接使用硬编码的配置
// 配置已从 supabase_key 文件中读取并硬编码到变量中
console.log('✅ Supabase 配置已加载')

// Supabase API 工具类
class SupabaseAPI {
  
  // 是否使用本地存储模式
  static useLocalStorage = false
  static connectionTested = false
  
  // 测试后端连接
  static async testConnection() {
    if (this.connectionTested) return this.useLocalStorage
    
    try {
      const result = await APIUtils.get(supabaseUrl + '/rest/v1/baby_food_recipes?limit=1', {}, {
        showLoading: false,
        showError: false
      })
      this.useLocalStorage = false
      this.connectionTested = true
      console.log('Supabase连接正常')
      return false
    } catch (error) {
      console.log('Supabase连接失败，切换到本地存储模式:', error.message)
      this.useLocalStorage = true
      this.connectionTested = true
      // 初始化本地存储示例数据
      await LocalStorageAPI.initDemoData()
      return true
    }
  }
  
  // 通用请求方法
  static async request(endpoint, method = 'GET', data = null) {
    // 如果是本地存储模式，直接返回降级结果
    if (this.useLocalStorage) {
      throw new Error('LOCAL_STORAGE_MODE')
    }
    
    try {
      const result = await APIUtils.request({
        url: supabaseUrl + endpoint,
        method: method,
        data: data,
        header: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        showLoading: false,
        showError: false
      })
      return result
    } catch (error) {
      // 如果网络请求失败，标记为本地存储模式
      if (error.message.includes('网络') || error.message.includes('超时')) {
        this.useLocalStorage = true
        console.log('网络请求失败，切换到本地存储模式')
        throw new Error('LOCAL_STORAGE_MODE')
      }
      throw error
    }
  }

  // 用户资料管理
  static async getUserProfile(userId) {
    try {
      const result = await this.request(`/rest/v1/profiles?user_id=eq.${userId}&select=*`)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.getUserProfile(userId)
      }
      throw error
    }
  }

  static async updateUserProfile(userId, updates) {
    try {
      const result = await this.request(`/rest/v1/profiles?user_id=eq.${userId}`, 'PATCH', updates)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.updateUserProfile(userId, updates)
      }
      throw error
    }
  }

  // 宝宝管理
  static async getUserBabies(profileId) {
    try {
      const result = await this.request(`/rest/v1/babies?profile_id=eq.${profileId}&select=*&order=created_at.desc`)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.getUserBabies(profileId)
      }
      throw error
    }
  }

  static async createBaby(profileId, babyData) {
    try {
      const data = { ...babyData, profile_id: profileId }
      const result = await this.request('/rest/v1/babies', 'POST', data)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.createBaby(profileId, babyData)
      }
      throw error
    }
  }

  static async updateBaby(babyId, updates) {
    try {
      const result = await this.request(`/rest/v1/babies?id=eq.${babyId}`, 'PATCH', updates)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.updateBaby(babyId, updates)
      }
      throw error
    }
  }

  static async deleteBaby(babyId) {
    try {
      const result = await this.request(`/rest/v1/babies?id=eq.${babyId}`, 'DELETE')
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.deleteBaby(babyId)
      }
      throw error
    }
  }

  // 生长记录
  static async getBabyGrowthRecords(babyId) {
    try {
      const result = await this.request(`/rest/v1/baby_growth_records?baby_id=eq.${babyId}&select=*&order=record_date.desc`)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.getBabyGrowthRecords(babyId)
      }
      throw error
    }
  }

  static async addGrowthRecord(babyId, recordData) {
    try {
      const data = { ...recordData, baby_id: babyId }
      const result = await this.request('/rest/v1/baby_growth_records', 'POST', data)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.addGrowthRecord(babyId, recordData)
      }
      throw error
    }
  }

  // 里程碑记录
  static async getBabyMilestones(babyId) {
    try {
      const result = await this.request(`/rest/v1/milestones?baby_id=eq.${babyId}&select=*&order=milestone_date.desc`)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.getBabyMilestones(babyId)
      }
      throw error
    }
  }

  static async addMilestone(babyId, milestoneData) {
    try {
      const data = { ...milestoneData, baby_id: babyId }
      const result = await this.request('/rest/v1/milestones', 'POST', data)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.addMilestone(babyId, milestoneData)
      }
      throw error
    }
  }

  // 母婴设施查询
  static async getNearbyFacilities(lat, lng, radius = 5, facilityType = null) {
    try {
      let url = `/rest/v1/maternal_facilities?select=*`
      
      if (facilityType) {
        url += `&facility_type=eq.${facilityType}`
      }
      
      const facilities = await this.request(url)
      return facilities.map(facility => ({
        ...facility,
        distance: this.calculateDistance(lat, lng, facility.latitude, facility.longitude)
      })).sort((a, b) => a.distance - b.distance)
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.getNearbyFacilities(lat, lng, radius, facilityType)
      }
      throw error
    }
  }

  // 闲置物品
  static async getSecondhandItems(filters = {}) {
    try {
      let url = `/rest/v1/secondhand_items?status=eq.available&select=*,profiles(nickname,avatar_url)&order=created_at.desc`
      
      if (filters.category) {
        url += `&category=eq.${filters.category}`
      }
      if (filters.search) {
        url += `&title=ilike.*${filters.search}*`
      }
      
      return await this.request(url)
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.getSecondhandItems(filters)
      }
      throw error
    }
  }

  static async createSecondhandItem(profileId, itemData) {
    try {
      const data = { ...itemData, profile_id: profileId }
      const result = await this.request('/rest/v1/secondhand_items', 'POST', data)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.createSecondhandItem(profileId, itemData)
      }
      throw error
    }
  }

  // 辅食食谱
  static async getBabyFoodRecipes(filters = {}) {
    try {
      let url = `/rest/v1/baby_food_recipes?select=*&order=view_count.desc`
      
      if (filters.suitableAge) {
        url += `&suitable_age=eq.${filters.suitableAge}`
      }
      if (filters.difficulty) {
        url += `&difficulty=eq.${filters.difficulty}`
      }
      
      return await this.request(url)
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.getBabyFoodRecipes(filters)
      }
      throw error
    }
  }

  // 设施评价
  static async getFacilityReviews(facilityId) {
    try {
      const result = await this.request(`/rest/v1/facility_reviews?facility_id=eq.${facilityId}&select=*,profiles(nickname,avatar_url)&order=created_at.desc`)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.getFacilityReviews(facilityId)
      }
      throw error
    }
  }

  static async addFacilityReview(profileId, facilityId, reviewData) {
    try {
      const data = { ...reviewData, profile_id: profileId, facility_id: facilityId }
      const result = await this.request('/rest/v1/facility_reviews', 'POST', data)
      return result
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.addFacilityReview(profileId, facilityId, reviewData)
      }
      throw error
    }
  }

  // 计算两个坐标点之间的距离（公里）
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return Math.round(distance * 100) / 100
  }

  // 文件上传（小程序使用 wx.uploadFile）
  static async uploadFile(filePath, bucketName = 'images') {
    try {
      if (this.useLocalStorage) {
        // 本地存储模式，返回模拟的文件路径
        const fileName = `${Date.now()}-${filePath.split('/').pop()}`
        return `/local-images/${fileName}`
      }
      
      const uploadUrl = supabaseUrl + `/storage/v1/object/${bucketName}/${Date.now()}-${filePath.split('/').pop()}`
      const result = await APIUtils.uploadFile(filePath, uploadUrl, {}, {
        showError: true
      })
      
      if (typeof result === 'string') {
        return result
      } else {
        return result.Key || result.path
      }
    } catch (error) {
      // 上传失败时返回本地模拟路径
      console.warn('文件上传失败，使用本地路径:', error.message)
      const fileName = `${Date.now()}-${filePath.split('/').pop()}`
      return `/local-images/${fileName}`
    }
  }
}

// 导出 API 类
module.exports = SupabaseAPI