/**
 * Supabase 配置文件
 * 宝妈育儿轻指南小程序后端集成
 * 适配小程序环境，使用 wx.request 代替 Supabase JS 客户端
 */

// Supabase 配置
const supabaseUrl = 'https://fhtmhmeglsqggtupvhqn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodG1obWVnbHNxZ2d0dXB2aHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTU4MzksImV4cCI6MjA3ODkzMTgzOX0.WXHppt4O5JUPrdWkQZstdWy9gKWgT5cIkzoTDaCie_U'

// Supabase API 工具类
class SupabaseAPI {
  
  // 通用请求方法
  static async request(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: supabaseUrl + endpoint,
        method: method,
        data: data,
        header: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }

  // 用户资料管理
  static async getUserProfile(userId) {
    return this.request(`/rest/v1/profiles?user_id=eq.${userId}&select=*`)
  }

  static async updateUserProfile(userId, updates) {
    return this.request(`/rest/v1/profiles?user_id=eq.${userId}`, 'PATCH', updates)
  }

  // 宝宝管理
  static async getUserBabies(profileId) {
    return this.request(`/rest/v1/babies?profile_id=eq.${profileId}&select=*&order=created_at.desc`)
  }

  static async createBaby(profileId, babyData) {
    const data = { ...babyData, profile_id: profileId }
    return this.request('/rest/v1/babies', 'POST', data)
  }

  static async updateBaby(babyId, updates) {
    return this.request(`/rest/v1/babies?id=eq.${babyId}`, 'PATCH', updates)
  }

  static async deleteBaby(babyId) {
    return this.request(`/rest/v1/babies?id=eq.${babyId}`, 'DELETE')
  }

  // 生长记录
  static async getBabyGrowthRecords(babyId) {
    return this.request(`/rest/v1/baby_growth_records?baby_id=eq.${babyId}&select=*&order=record_date.desc`)
  }

  static async addGrowthRecord(babyId, recordData) {
    const data = { ...recordData, baby_id: babyId }
    return this.request('/rest/v1/baby_growth_records', 'POST', data)
  }

  // 里程碑记录
  static async getBabyMilestones(babyId) {
    return this.request(`/rest/v1/milestones?baby_id=eq.${babyId}&select=*&order=milestone_date.desc`)
  }

  static async addMilestone(babyId, milestoneData) {
    const data = { ...milestoneData, baby_id: babyId }
    return this.request('/rest/v1/milestones', 'POST', data)
  }

  // 母婴设施查询
  static async getNearbyFacilities(lat, lng, radius = 5, facilityType = null) {
    let url = `/rest/v1/maternal_facilities?select=*`
    
    if (facilityType) {
      url += `&facility_type=eq.${facilityType}`
    }
    
    return this.request(url).then(facilities => {
      // 计算距离并排序
      return facilities.map(facility => ({
        ...facility,
        distance: this.calculateDistance(lat, lng, facility.latitude, facility.longitude)
      })).sort((a, b) => a.distance - b.distance)
    })
  }

  // 闲置物品
  static async getSecondhandItems(filters = {}) {
    let url = `/rest/v1/secondhand_items?status=eq.available&select=*,profiles(nickname,avatar_url)&order=created_at.desc`
    
    if (filters.category) {
      url += `&category=eq.${filters.category}`
    }
    if (filters.search) {
      url += `&title=ilike.*${filters.search}*`
    }
    
    return this.request(url)
  }

  static async createSecondhandItem(profileId, itemData) {
    const data = { ...itemData, profile_id: profileId }
    return this.request('/rest/v1/secondhand_items', 'POST', data)
  }

  // 辅食食谱
  static async getBabyFoodRecipes(filters = {}) {
    let url = `/rest/v1/baby_food_recipes?select=*&order=view_count.desc`
    
    if (filters.suitableAge) {
      url += `&suitable_age=eq.${filters.suitableAge}`
    }
    if (filters.difficulty) {
      url += `&difficulty=eq.${filters.difficulty}`
    }
    
    return this.request(url)
  }

  // 设施评价
  static async getFacilityReviews(facilityId) {
    return this.request(`/rest/v1/facility_reviews?facility_id=eq.${facilityId}&select=*,profiles(nickname,avatar_url)&order=created_at.desc`)
  }

  static async addFacilityReview(profileId, facilityId, reviewData) {
    const data = { ...reviewData, profile_id: profileId, facility_id: facilityId }
    return this.request('/rest/v1/facility_reviews', 'POST', data)
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
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: supabaseUrl + `/storage/v1/object/${bucketName}/${Date.now()}-${filePath.split('/').pop()}`,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data)
            resolve(data.Key)
          } else {
            reject(new Error(`上传失败: ${res.statusCode}`))
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  }
}

// 导出 API 类
module.exports = SupabaseAPI