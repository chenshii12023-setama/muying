/**
 * Supabase 配置文件
 * 宝妈育儿轻指南小程序后端集成
 */

const APIUtils = require('./utils/api.js')

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
  
  // 测试后端连接 - 强制使用数据库
  static async testConnection() {
    console.log('🔍 开始测试 Supabase 连接...')
    
    try {
      // 测试商品表连接
      const result = await this.request('/rest/v1/secondhand_items?limit=1')
      
      this.useLocalStorage = false
      this.connectionTested = true
      console.log('✅ Supabase连接正常，强制使用数据库')
      return false // false 表示不使用本地存储
    } catch (error) {
      console.error('❌ Supabase连接失败:', error.message)
      throw new Error(`数据库连接失败，请检查网络配置: ${error.message}`)
    }
  }
  
  // 通用请求方法 - 强制使用数据库
  static async request(endpoint, method = 'GET', data = null) {
    console.log('🌐 发起 Supabase 请求:', method, endpoint)
    
    try {
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
      console.log('✅ Supabase 请求成功')
      return result
    } catch (error) {
      console.error('❌ Supabase 请求失败:', error.message)
      console.error('📍 详细错误:', error)
      
      // 不再降级到本地存储，直接抛出错误
      throw new Error(`数据库操作失败: ${error.message}`)
    }
  }

  // --- 下面的业务方法保持不变，它们现在会正确调用上面的 request ---

  static async getUserProfile(userId) {
    const result = await this.request(`/rest/v1/profiles?user_id=eq.${userId}&select=*`)
    return result
  }

  static async updateUserProfile(userId, updates) {
    const result = await this.request(`/rest/v1/profiles?user_id=eq.${userId}`, 'PATCH', updates)
    return result
  }

  static async getUserBabies(profileId) {
    const result = await this.request(`/rest/v1/babies?profile_id=eq.${profileId}&select=*&order=created_at.desc`)
    return result
  }

  static async createBaby(profileId, babyData) {
    const data = { ...babyData, profile_id: profileId }
    const result = await this.request('/rest/v1/babies', 'POST', data)
    // POST with Prefer: return=representation returns array
    return result && result.length ? result[0] : result;
  }

  static async updateBaby(babyId, updates) {
    const result = await this.request(`/rest/v1/babies?id=eq.${babyId}`, 'PATCH', updates)
    return result && result.length ? result[0] : result;
  }

  static async deleteBaby(babyId) {
    const result = await this.request(`/rest/v1/babies?id=eq.${babyId}`, 'DELETE')
    return result
  }

  static async getBabyGrowthRecords(babyId) {
    const result = await this.request(`/rest/v1/baby_growth_records?baby_id=eq.${babyId}&select=*&order=record_date.desc`)
    return result
  }

  static async addGrowthRecord(babyId, recordData) {
    const data = { ...recordData, baby_id: babyId }
    const result = await this.request('/rest/v1/baby_growth_records', 'POST', data)
    return result && result.length ? result[0] : result;
  }

  static async getBabyMilestones(babyId) {
    const result = await this.request(`/rest/v1/milestones?baby_id=eq.${babyId}&select=*&order=milestone_date.desc`)
    return result
  }

  static async addMilestone(babyId, milestoneData) {
    const data = { ...milestoneData, baby_id: babyId }
    const result = await this.request('/rest/v1/milestones', 'POST', data)
    return result && result.length ? result[0] : result;
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
    let url = `/rest/v1/secondhand_items?status=eq.available&select=*,profiles(nickname,avatar_url)&order=created_at.desc`
    if (filters.category) {
      url += `&category=eq.${filters.category}`
    }
    if (filters.search) {
      url += `&title=ilike.*${filters.search}*`
    }
    if (filters.id) {
      url += `&id=eq.${filters.id}`
    }
    if (filters.profile_id) {
      url += `&profile_id=eq.${filters.profile_id}`
    }
    return await this.request(url)
  }

  // 新增方法：根据ID获取单个商品
  static async getSecondhandItemById(itemId) {
    const result = await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}&select=*,profiles(nickname,avatar_url)`)
    return result && result.length > 0 ? result[0] : null
  }

  static async createSecondhandItem(profileId, itemData) {
    try {
      // 先检查profile是否存在，如果不存在则创建
      let profile = null
      try {
        const profiles = await this.request(`/rest/v1/profiles?id=eq.${profileId}&select=*`)
        profile = profiles && profiles.length > 0 ? profiles[0] : null
      } catch (error) {
        console.warn('检查profile失败:', error.message)
      }
      
      // 如果profile不存在，创建一个
      if (!profile) {
        console.log('Profile不存在，创建新的profile...')
        try {
          const newProfiles = await this.request('/rest/v1/profiles', 'POST', {
            id: profileId,
            user_id: profileId,
            nickname: '用户' + Date.now().toString().slice(-4),
            avatar_url: '/images/default-avatar.png'
          })
          profile = newProfiles && newProfiles.length > 0 ? newProfiles[0] : null
          console.log('✅ 新profile创建成功:', profile)
        } catch (createError) {
          console.error('❌ 创建profile失败:', createError.message)
          throw createError
        }
      } else {
        console.log('✅ 使用已存在的profile:', profile.id)
      }
      
      // 现在安全地创建商品
      const data = { ...itemData, profile_id: profileId }
      const result = await this.request('/rest/v1/secondhand_items', 'POST', data)
      
      // Supabase POST 返回数组，取第一个元素
      return result && result.length > 0 ? result[0] : result
    } catch (error) {
      console.error('创建商品失败:', error.message)
      throw error
    }
  }

  static async updateSecondhandItem(itemId, updates) {
    const result = await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', updates)
    return result && result.length ? result[0] : result
  }

  static async deleteSecondhandItem(itemId) {
    const result = await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'DELETE')
    return result
  }

  static async incrementItemViewCount(itemId) {
    try {
      // 先获取当前浏览量
      const currentItem = await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}&select=view_count`)
      if (currentItem && currentItem.length > 0) {
        const currentViewCount = currentItem[0].view_count || 0
        const newViewCount = currentViewCount + 1
        
        // 更新浏览量
        await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', {
          view_count: newViewCount
        })
        
        console.log(`✅ 浏览量更新成功: ${currentViewCount} -> ${newViewCount}`)
      }
    } catch (error) {
      console.warn('更新浏览量失败:', error.message)
    }
  }

  static async incrementItemInquiryCount(itemId) {
    try {
      // 先获取当前咨询次数
      const currentItem = await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}&select=inquiry_count`)
      if (currentItem && currentItem.length > 0) {
        const currentInquiryCount = currentItem[0].inquiry_count || 0
        const newInquiryCount = currentInquiryCount + 1
        
        // 更新咨询次数
        await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', {
          inquiry_count: newInquiryCount
        })
        
        console.log(`✅ 咨询次数更新成功: ${currentInquiryCount} -> ${newInquiryCount}`)
        return newInquiryCount
      }
    } catch (error) {
      console.warn('更新咨询次数失败:', error.message)
      return null
    }
  }

  static async getItemFavorites(profileId) {
    try {
      // 先获取收藏记录
      const favorites = await this.request(`/rest/v1/item_favorites?profile_id=eq.${profileId}&select=item_id`)
      
      if (!favorites || favorites.length === 0) {
        return []
      }
      
      // 获取商品ID列表
      const itemIds = favorites.map(fav => fav.item_id)
      
      // 分批查询商品详情（避免URL过长）
      const items = []
      for (let i = 0; i < itemIds.length; i += 50) {
        const batch = itemIds.slice(i, i + 50)
        const idParams = batch.map(id => `id=eq.${id}`).join('&')
        const batchItems = await this.request(`/rest/v1/secondhand_items?${idParams}&select=*,profiles(nickname,avatar_url)`)
        items.push(...(batchItems || []))
      }
      
      return items
    } catch (error) {
      console.error('获取收藏列表失败:', error.message)
      return []
    }
  }

  static async toggleItemFavorite(itemId, profileId) {
    // 先检查是否已收藏
    let url = `/rest/v1/item_favorites?item_id=eq.${itemId}&profile_id=eq.${profileId}`
    const existing = await this.request(url)
    
    if (existing && existing.length > 0) {
      // 取消收藏
      await this.request(`/rest/v1/item_favorites?item_id=eq.${itemId}&profile_id=eq.${profileId}`, 'DELETE')
      
      // 减少收藏次数
      await this.decrementItemFavoriteCount(itemId)
      
      return false
    } else {
      // 添加收藏
      await this.request('/rest/v1/item_favorites', 'POST', {
        item_id: itemId,
        profile_id: profileId
      })
      
      // 增加收藏次数
      await this.incrementItemFavoriteCount(itemId)
      
      return true
    }
  }

  static async incrementItemFavoriteCount(itemId) {
    try {
      // 先获取当前收藏次数
      const currentItem = await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}&select=favorite_count`)
      if (currentItem && currentItem.length > 0) {
        const currentFavoriteCount = currentItem[0].favorite_count || 0
        const newFavoriteCount = currentFavoriteCount + 1
        
        // 更新收藏次数
        await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', {
          favorite_count: newFavoriteCount
        })
        
        console.log(`✅ 收藏次数增加成功: ${currentFavoriteCount} -> ${newFavoriteCount}`)
        return newFavoriteCount
      }
    } catch (error) {
      console.warn('增加收藏次数失败:', error.message)
      return null
    }
  }

  static async decrementItemFavoriteCount(itemId) {
    try {
      // 先获取当前收藏次数
      const currentItem = await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}&select=favorite_count`)
      if (currentItem && currentItem.length > 0) {
        const currentFavoriteCount = currentItem[0].favorite_count || 0
        const newFavoriteCount = Math.max(0, currentFavoriteCount - 1) // 确保不为负数
        
        // 更新收藏次数
        await this.request(`/rest/v1/secondhand_items?id=eq.${itemId}`, 'PATCH', {
          favorite_count: newFavoriteCount
        })
        
        console.log(`✅ 收藏次数减少成功: ${currentFavoriteCount} -> ${newFavoriteCount}`)
        return newFavoriteCount
      }
    } catch (error) {
      console.warn('减少收藏次数失败:', error.message)
      return null
    }
  }

  static async getBabyFoodRecipes(filters = {}) {
    let url = `/rest/v1/baby_food_recipes?select=*&order=view_count.desc`
    if (filters.suitableAge) {
      url += `&suitable_age=eq.${filters.suitableAge}`
    }
    if (filters.difficulty) {
      url += `&difficulty=eq.${filters.difficulty}`
    }
    return await this.request(url)
  }

  static async getFacilityReviews(facilityId) {
    const result = await this.request(`/rest/v1/facility_reviews?facility_id=eq.${facilityId}&select=*,profiles(nickname,avatar_url)&order=created_at.desc`)
    return result
  }

  static async addFacilityReview(profileId, facilityId, reviewData) {
    const data = { ...reviewData, profile_id: profileId, facility_id: facilityId }
    const result = await this.request('/rest/v1/facility_reviews', 'POST', data)
    return result
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

  // 发送商品消息
  static async sendMessage(itemId, senderId, receiverId, content, messageType = 'inquiry') {
    try {
      const messageData = {
        item_id: itemId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
        message_type: messageType,
        is_read: false
      }
      
      console.log('📨 准备发送消息:', messageData)
      const result = await this.request('/rest/v1/item_messages', 'POST', messageData)
      console.log('✅ 消息发送成功:', result)
      return result && result.length > 0 ? result[0] : result
    } catch (error) {
      console.error('❌ 发送消息失败:', error.message)
      console.error('📍 详细错误信息:', error)
      throw new Error(`发送消息失败: ${error.message}`)
    }
  }

  // 获取商品相关的消息
  static async getItemMessages(itemId, profileId = null) {
    try {
      let url = `/rest/v1/item_messages?item_id=eq.${itemId}&select=*,sender:profiles!sender_id(nickname,avatar_url),receiver:profiles!receiver_id(nickname,avatar_url)&order=created_at.desc`
      
      // 如果指定了用户ID，只获取该用户相关的消息
      if (profileId) {
        url = `/rest/v1/item_messages?or=(and(item_id.eq.${itemId},sender_id.eq.${profileId}),and(item_id.eq.${itemId},receiver_id.eq.${profileId}))&select=*,sender:profiles!sender_id(nickname,avatar_url),receiver:profiles!receiver_id(nickname,avatar_url)&order=created_at.desc`
      }
      
      const result = await this.request(url)
      return result || []
    } catch (error) {
      console.error('获取消息失败:', error.message)
      return []
    }
  }

  // 获取用户的消息列表
  static async getUserMessages(profileId) {
    try {
      const url = `/rest/v1/item_messages?or=(sender_id.eq.${profileId},receiver_id.eq.${profileId})&select=*,item:secondhand_items(id,title,price,images),sender:profiles!sender_id(nickname,avatar_url),receiver:profiles!receiver_id(nickname,avatar_url)&order=created_at.desc`
      
      const result = await this.request(url)
      return result || []
    } catch (error) {
      console.error('获取用户消息失败:', error.message)
      return []
    }
  }

  // 标记消息为已读
  static async markMessageAsRead(messageId, userId) {
    try {
      // 只有接收者才能标记为已读
      const url = `/rest/v1/item_messages?id=eq.${messageId}&receiver_id=eq.${userId}`
      const result = await this.request(url, 'PATCH', { is_read: true })
      return result && result.length > 0 ? result[0] : null
    } catch (error) {
      console.error('标记消息已读失败:', error.message)
      return null
    }
  }

  // 删除消息
  static async deleteMessage(messageId, userId) {
    try {
      // 只有发送者或接收者才能删除消息
      const url = `/rest/v1/item_messages?id=eq.${messageId}&or=(sender_id.eq.${userId},receiver_id.eq.${userId})`
      const result = await this.request(url, 'DELETE')
      return result
    } catch (error) {
      console.error('删除消息失败:', error.message)
      throw new Error(`删除消息失败: ${error.message}`)
    }
  }

  // 文件上传到Supabase存储
  static async uploadFile(filePath, bucketName = 'market-images') {
    try {
      // 生成唯一文件名
      const fileExt = filePath.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`
      
      console.log('开始上传文件:', filePath, '->', uploadUrl)
      
      // 使用微信小程序的uploadFile
      const result = await APIUtils.uploadFile(filePath, uploadUrl, {}, {
        showError: true,
        header: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })
      
      console.log('上传成功:', result)
      
      // 返回公开访问URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`
      console.log('文件访问URL:', publicUrl)
      
      return publicUrl
    } catch (error) {
      console.error('文件上传失败:', error)
      throw error
    }
  }
}

module.exports = SupabaseAPI