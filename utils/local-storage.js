/**
 * 本地存储模拟层
 * 作为后端不可用时的降级方案
 */

class LocalStorageAPI {
  
  // 生成唯一ID
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 通用存储方法
  static async set(key, data) {
    try {
      wx.setStorageSync(key, data)
      return { success: true, data: data }
    } catch (error) {
      throw new Error(`存储失败: ${error.message}`)
    }
  }

  // 通用获取方法
  static async get(key, defaultValue = null) {
    try {
      const data = wx.getStorageSync(key)
      return data || defaultValue
    } catch (error) {
      return defaultValue
    }
  }

  // 用户资料管理
  static async getUserProfile(userId) {
    const profiles = await this.get('userProfiles', [])
    return profiles.find(profile => profile.user_id === userId) || null
  }

  static async updateUserProfile(userId, updates) {
    const profiles = await this.get('userProfiles', [])
    const index = profiles.findIndex(profile => profile.user_id === userId)
    
    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...updates, updated_at: new Date().toISOString() }
    } else {
      profiles.push({
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates
      })
    }
    
    await this.set('userProfiles', profiles)
    return profiles[index]
  }

  // 宝宝管理
  static async getUserBabies(profileId) {
    const babies = await this.get('babies', [])
    return babies
      .filter(baby => baby.profile_id === profileId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  static async createBaby(profileId, babyData) {
    const babies = await this.get('babies', [])
    const newBaby = {
      id: this.generateId(),
      profile_id: profileId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...babyData
    }
    
    babies.push(newBaby)
    await this.set('babies', babies)
    return newBaby
  }

  static async updateBaby(babyId, updates) {
    const babies = await this.get('babies', [])
    const index = babies.findIndex(baby => baby.id === babyId)
    
    if (index >= 0) {
      babies[index] = { ...babies[index], ...updates, updated_at: new Date().toISOString() }
      await this.set('babies', babies)
      return babies[index]
    } else {
      throw new Error('宝宝信息不存在')
    }
  }

  static async deleteBaby(babyId) {
    const babies = await this.get('babies', [])
    const index = babies.findIndex(baby => baby.id === babyId)
    
    if (index >= 0) {
      const deletedBaby = babies.splice(index, 1)[0]
      await this.set('babies', babies)
      return deletedBaby
    } else {
      throw new Error('宝宝信息不存在')
    }
  }

  // 成长记录
  static async getBabyGrowthRecords(babyId) {
    const records = await this.get('growthRecords', [])
    return records
      .filter(record => record.baby_id === babyId)
      .sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
  }

  static async addGrowthRecord(babyId, recordData) {
    const records = await this.get('growthRecords', [])
    const newRecord = {
      id: this.generateId(),
      baby_id: babyId,
      record_date: recordData.record_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      ...recordData
    }
    
    records.push(newRecord)
    await this.set('growthRecords', records)
    return newRecord
  }

  // 里程碑记录
  static async getBabyMilestones(babyId) {
    const milestones = await this.get('milestones', [])
    return milestones
      .filter(milestone => milestone.baby_id === babyId)
      .sort((a, b) => new Date(b.milestone_date) - new Date(a.milestone_date))
  }

  static async addMilestone(babyId, milestoneData) {
    const milestones = await this.get('milestones', [])
    const newMilestone = {
      id: this.generateId(),
      baby_id: babyId,
      milestone_date: milestoneData.milestone_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      ...milestoneData
    }
    
    milestones.push(newMilestone)
    await this.set('milestones', newMilestone)
    return newMilestone
  }

  // 母婴设施
  static async getNearbyFacilities(lat, lng, radius = 5, facilityType = null) {
    let facilities = await this.get('maternalFacilities', [])
    
    // 筛选类型
    if (facilityType) {
      facilities = facilities.filter(facility => facility.facility_type === facilityType)
    }
    
    // 计算距离并排序
    facilities = facilities.map(facility => ({
      ...facility,
      distance: this.calculateDistance(lat, lng, facility.latitude, facility.longitude)
    })).sort((a, b) => a.distance - b.distance)
    
    // 筛选半径内的设施
    return facilities.filter(facility => facility.distance <= radius)
  }

  // 闲置物品
  static async getSecondhandItems(filters = {}) {
    let items = await this.get('secondhandItems', [])
    
    // 筛选可用物品
    items = items.filter(item => item.status === 'available')
    
    // 分类筛选
    if (filters.category) {
      items = items.filter(item => item.category === filters.category)
    }
    
    // 搜索筛选
    if (filters.search) {
      const keyword = filters.search.toLowerCase()
      items = items.filter(item => 
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      )
    }
    
    // 按创建时间排序
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  static async createSecondhandItem(profileId, itemData) {
    const items = await this.get('secondhandItems', [])
    const newItem = {
      id: this.generateId(),
      profile_id: profileId,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...itemData
    }
    
    items.push(newItem)
    await this.set('secondhandItems', items)
    return newItem
  }

  // 辅食食谱
  static async getBabyFoodRecipes(filters = {}) {
    let recipes = await this.get('babyFoodRecipes', [])
    
    if (filters.suitableAge) {
      recipes = recipes.filter(recipe => recipe.suitable_age === filters.suitableAge)
    }
    
    if (filters.difficulty) {
      recipes = recipes.filter(recipe => recipe.difficulty === filters.difficulty)
    }
    
    return recipes.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
  }

  // 设施评价
  static async getFacilityReviews(facilityId) {
    const reviews = await this.get('facilityReviews', [])
    const profiles = await this.get('userProfiles', [])
    
    return reviews
      .filter(review => review.facility_id === facilityId)
      .map(review => {
        const profile = profiles.find(p => p.user_id === review.profile_id)
        return {
          ...review,
          profiles: profile ? {
            nickname: profile.nickname || '匿名用户',
            avatar_url: profile.avatar_url || ''
          } : { nickname: '匿名用户', avatar_url: '' }
        }
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  static async addFacilityReview(profileId, facilityId, reviewData) {
    const reviews = await this.get('facilityReviews', [])
    const newReview = {
      id: this.generateId(),
      profile_id: profileId,
      facility_id: facilityId,
      created_at: new Date().toISOString(),
      ...reviewData
    }
    
    reviews.push(newReview)
    await this.set('facilityReviews', reviews)
    return newReview
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

  // 初始化示例数据
  static async initDemoData() {
    // 检查是否已初始化
    const initialized = await this.get('demoDataInitialized', false)
    if (initialized) return

    try {
      // 初始化示例食谱
      const demoRecipes = [
        {
          id: this.generateId(),
          title: '南瓜米糊',
          description: '适合6个月以上宝宝的第一次辅食',
          suitable_age: '6个月',
          difficulty: '简单',
          ingredients: ['南瓜50g', '米糊30g'],
          steps: ['南瓜蒸熟压成泥', '与米糊混合调匀'],
          view_count: 156,
          created_at: new Date().toISOString()
        },
        {
          id: this.generateId(),
          title: '苹果泥',
          description: '富含维生素的天然水果泥',
          suitable_age: '6个月',
          difficulty: '简单',
          ingredients: ['苹果1个'],
          steps: ['苹果去皮去核', '蒸熟或蒸熟压成泥'],
          view_count: 234,
          created_at: new Date().toISOString()
        }
      ]
      
      // 初始化示例设施
      const demoFacilities = [
        {
          id: this.generateId(),
          name: '万达广场母婴室',
          facility_type: 'nursing',
          address: '人民路188号万达广场3楼',
          latitude: 31.2304,
          longitude: 121.4737,
          rating: 4.5,
          review_count: 128,
          tags: ['尿布台', '免费', '热水', '消毒柜'],
          created_at: new Date().toISOString()
        }
      ]
      
      await this.set('babyFoodRecipes', demoRecipes)
      await this.set('maternalFacilities', demoFacilities)
      await this.set('demoDataInitialized', true)
      
      console.log('本地存储示例数据初始化完成')
    } catch (error) {
      console.error('初始化示例数据失败:', error)
    }
  }
}

module.exports = LocalStorageAPI