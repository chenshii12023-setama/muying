/**
 * Supabase 配置文件
 * 宝妈育儿轻指南小程序后端集成
 */

const APIUtils = require('./utils/api.js')
const LocalStorageAPI = require('./utils/local-storage.js')

// Supabase 配置
let supabaseUrl = 'https://zbhlrnecjmdpuaxvhneu.supabase.co'
let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o'

// [安全修复]：移除了 supabaseServiceRoleKey
// 千万不要在小程序前端代码中包含 Service Role Key！这会赋予所有用户管理员权限。
// 数据的读写权限应通过 Supabase Dashboard 中的 RLS Policies (Row Level Security) 进行控制。

console.log('✅ Supabase 配置已加载')

class SupabaseAPI {
  
  // 是否使用本地存储模式
  static useLocalStorage = false
  static connectionTested = false
  
  // 测试后端连接
  static async testConnection() {
    if (this.connectionTested) return this.useLocalStorage
    
    console.log('🔍 开始测试 Supabase 连接...')
    
    try {
      // 使用 Anon Key 进行连接测试
      const result = await new Promise((resolve, reject) => {
        // 请求 recipes 表，请确保 RLS 允许 public 角色读取
        const requestUrl = supabaseUrl + '/rest/v1/baby_food_recipes?limit=1'
        
        wx.request({
          url: requestUrl,
          method: 'GET',
          timeout: 10000,
          header: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`, // 使用 Anon Key
            'Content-Type': 'application/json'
          },
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log('✅ HTTP 请求成功')
              resolve(res.data)
            } else {
              console.log('❌ HTTP 请求失败，状态码:', res.statusCode)
              reject(new Error(`HTTP ${res.statusCode}`))
            }
          },
          fail: (error) => {
            reject(new Error(`网络请求失败`))
          }
        })
      })
      
      this.useLocalStorage = false
      this.connectionTested = true
      console.log('✅ Supabase连接正常 (使用 Anon Key)')
      return false
    } catch (error) {
      console.log('⚠️ Supabase连接失败，切换到本地存储模式:', error.message)
      this.useLocalStorage = true
      this.connectionTested = true
      try {
        if (LocalStorageAPI && LocalStorageAPI.initDemoData) {
           await LocalStorageAPI.initDemoData()
        }
      } catch (initError) {
        console.log('⚠️ 本地存储初始化失败:', initError.message)
      }
      return true
    }
  }
  
  // 通用请求方法
  static async request(endpoint, method = 'GET', data = null) {
    // 如果是本地存储模式，直接返回降级结果
    if (this.useLocalStorage) {
      throw new Error('LOCAL_STORAGE_MODE')
    }
    
    // console.log('🌐 发起 Supabase 请求:', method, endpoint)
    
    try {
      // [核心]：这里明确传入了 Header，APIUtils 现在会优先使用这些 Header
      // 而不会被本地的 login_token 覆盖
      const result = await APIUtils.request({
        url: supabaseUrl + endpoint,
        method: method,
        data: data,
        header: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`, 
          'Content-Type': 'application/json',
          'Prefer': 'return=representation' // 让 POST/PATCH 返回修改后的数据
        },
        showLoading: false,
        showError: false
      })
      return result
    } catch (error) {
      console.log('❌ Supabase 请求失败:', error.message)
      
      // 如果网络请求失败，标记为本地存储模式
      if (error.message.includes('网络') || error.message.includes('超时') || error.message.includes('request:fail')) {
        this.useLocalStorage = true
        console.log('🔄 网络请求失败，切换到本地存储模式')
        throw new Error('LOCAL_STORAGE_MODE')
      }
      throw error
    }
  }

  // --- 下面的业务方法保持不变，它们现在会正确调用上面的 request ---

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
      // POST with Prefer: return=representation returns array
      return result && result.length ? result[0] : result;
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
      return result && result.length ? result[0] : result;
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
      return result && result.length ? result[0] : result;
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.addGrowthRecord(babyId, recordData)
      }
      throw error
    }
  }

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
      return result && result.length ? result[0] : result;
    } catch (error) {
      if (error.message === 'LOCAL_STORAGE_MODE') {
        return await LocalStorageAPI.addMilestone(babyId, milestoneData)
      }
      throw error
    }
  }

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

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 
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

  // 文件上传
  static async uploadFile(filePath, bucketName = 'images') {
    try {
      if (this.useLocalStorage) {
        const fileName = `${Date.now()}-${filePath.split('/').pop()}`
        return `/local-images/${fileName}`
      }
      
      const fileName = `${Date.now()}-${filePath.split('/').pop()}`
      const uploadUrl = supabaseUrl + `/storage/v1/object/${bucketName}/${fileName}`
      
      // 确保 APIUtils.uploadFile 也能接收 header
      const result = await APIUtils.uploadFile(filePath, uploadUrl, {}, {
        showError: true,
        header: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })
      
      // 修正返回的路径
      return `/storage/v1/object/public/${bucketName}/${fileName}`
    } catch (error) {
      console.warn('文件上传失败，使用本地路径:', error.message)
      const fileName = `${Date.now()}-${filePath.split('/').pop()}`
      return `/local-images/${fileName}`
    }
  }
}

module.exports = SupabaseAPI