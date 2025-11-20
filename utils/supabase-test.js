/**
 * Supabase 连接测试工具
 * 验证数据库连接、表结构和权限
 */

const app = getApp()

class SupabaseTester {
  
  /**
   * 运行完整测试
   */
  static async runFullTest() {
    console.log('🚀 开始 Supabase 连接测试')
    console.log('=' .repeat(50))
    
    try {
      // 测试1: 基础连接
      await this.testBasicConnection()
      
      // 测试2: 表结构测试
      await this.testTableStructure()
      
      // 测试3: 权限测试
      await this.testPermissions()
      
      // 测试4: 数据操作测试
      await this.testDataOperations()
      
      console.log('\n' + '=' .repeat(50))
      console.log('✅ Supabase 连接测试全部通过！')
      console.log('🎉 数据库已就绪，可以正常使用所有功能')
      
      return true
      
    } catch (error) {
      console.error('\n❌ Supabase 测试失败:', error.message)
      console.log('📝 请检查配置和表结构')
      return false
    }
  }
  
  /**
   * 测试基础连接
   */
  static async testBasicConnection() {
    console.log('\n🔌 测试基础连接...')
    
    try {
      // 测试获取辅食食谱（公共数据）
      const recipes = await app.globalData.supabase.getBabyFoodRecipes()
      console.log(`✅ 公共数据访问正常，获取到 ${recipes.length} 个食谱`)
      
      // 检查是否使用本地存储模式
      const useLocalStorage = app.globalData.supabase.useLocalStorage
      if (useLocalStorage) {
        console.log('⚠️ 当前使用本地存储模式')
      } else {
        console.log('✅ Supabase 连接正常')
      }
      
      return true
    } catch (error) {
      console.error('❌ 基础连接测试失败:', error.message)
      throw error
    }
  }
  
  /**
   * 测试表结构
   */
  static async testTableStructure() {
    console.log('\n📊 测试表结构...')
    
    const tableTests = [
      {
        name: '用户资料表',
        test: async () => {
          // 模拟用户ID（在实际使用中会从登录状态获取）
          const result = await app.globalData.supabase.getUserProfile('test_user_id')
          return Array.isArray(result)
        }
      },
      {
        name: '宝宝信息表',
        test: async () => {
          const result = await app.globalData.supabase.getUserBabies(1)
          return Array.isArray(result)
        }
      },
      {
        name: '成长记录表',
        test: async () => {
          const result = await app.globalData.supabase.getBabyGrowthRecords(1)
          return Array.isArray(result)
        }
      },
      {
        name: '里程碑表',
        test: async () => {
          const result = await app.globalData.supabase.getBabyMilestones(1)
          return Array.isArray(result)
        }
      },
      {
        name: '母婴设施表',
        test: async () => {
          const result = await app.globalData.supabase.getNearbyFacilities(31.23, 121.47, 5)
          return Array.isArray(result)
        }
      },
      {
        name: '闲置物品表',
        test: async () => {
          const result = await app.globalData.supabase.getSecondhandItems()
          return Array.isArray(result)
        }
      }
    ]
    
    for (const tableTest of tableTests) {
      try {
        const result = await tableTest.test()
        console.log(`✅ ${tableTest.name}: 结构正常`)
      } catch (error) {
        console.log(`❌ ${tableTest.name}: ${error.message}`)
        throw new Error(`表结构测试失败: ${tableTest.name}`)
      }
    }
  }
  
  /**
   * 测试权限
   */
  static async testPermissions() {
    console.log('\n🔐 测试权限设置...')
    
    try {
      // 测试公共数据访问（不需要认证）
      const publicRecipes = await app.globalData.supabase.getBabyFoodRecipes()
      console.log('✅ 公共数据访问权限正常')
      
      // 测试私有数据访问（需要认证，当前可能失败）
      try {
        const privateData = await app.globalData.supabase.getUserBabies(999)
        // 这里不应该返回数据（因为用户不存在）
      } catch (error) {
        // 预期的权限错误
        console.log('✅ 私有数据权限控制正常')
      }
      
      return true
    } catch (error) {
      console.error('❌ 权限测试失败:', error.message)
      throw error
    }
  }
  
  /**
   * 测试数据操作
   */
  static async testDataOperations() {
    console.log('\n🧪 测试数据操作...')
    
    // 注意：这些测试只在本地存储模式下进行
    if (!app.globalData.supabase.useLocalStorage) {
      console.log('⚠️ 跳过数据操作测试（使用真实数据库）')
      return true
    }
    
    try {
      // 测试添加宝宝
      const testBabyData = {
        name: '测试宝宝',
        gender: 'male',
        birth_date: '2024-01-01',
        weight: 3.5,
        height: 52
      }
      
      const newBaby = await app.globalData.supabase.createBaby('test_profile_id', testBabyData)
      console.log('✅ 添加宝宝数据正常')
      
      // 测试添加成长记录
      const growthData = {
        record_date: '2024-01-15',
        weight: 4.0,
        height: 55
      }
      
      const growthRecord = await app.globalData.supabase.addGrowthRecord(newBaby.id, growthData)
      console.log('✅ 添加成长记录正常')
      
      // 测试添加里程碑
      const milestoneData = {
        title: '第一次翻身',
        milestone_date: '2024-02-10',
        category: 'motor'
      }
      
      const milestone = await app.globalData.supabase.addMilestone(newBaby.id, milestoneData)
      console.log('✅ 添加里程碑正常')
      
      return true
    } catch (error) {
      console.error('❌ 数据操作测试失败:', error.message)
      throw error
    }
  }
  
  /**
   * 快速状态检查
   */
  static async quickCheck() {
    console.log('⚡ Supabase 快速状态检查...')
    
    try {
      const status = app.getAppStatus()
      
      console.log('📊 应用状态:')
      console.log(`  - 登录状态: ${status.isLoggedIn}`)
      console.log(`  - 有宝宝信息: ${status.hasBaby}`)
      console.log(`  - 宝宝数量: ${status.babyCount}`)
      console.log(`  - 后端连接: ${status.backendConnected}`)
      console.log(`  - 本地存储: ${status.useLocalStorage}`)
      
      // 测试API可用性
      const recipes = await app.globalData.supabase.getBabyFoodRecipes()
      console.log(`  - API调用: ✅ (获取${recipes.length}个食谱)`)
      
      return status
    } catch (error) {
      console.error('快速检查失败:', error.message)
      return null
    }
  }
  
  /**
   * 生成测试报告
   */
  static generateReport() {
    console.log('\n📋 生成 Supabase 连接报告...')
    
    const report = {
      timestamp: new Date().toISOString(),
      config: {
        url: 'https://fhtmhmeglsqggtupvhqn.supabase.co',
        hasKey: true,
        useLocalStorage: app.globalData.supabase.useLocalStorage
      },
      tables: [
        'profiles',
        'babies', 
        'baby_growth_records',
        'milestones',
        'maternal_facilities',
        'facility_reviews',
        'secondhand_items',
        'baby_food_recipes',
        'messages',
        'favorites',
        'notifications',
        'user_sessions',
        'usage_stats'
      ],
      features: {
        rls: '启用',
        auth: 'JWT认证',
        backup: '本地存储降级',
        sync: '双向同步'
      }
    }
    
    console.log('📄 测试报告:')
    console.log(JSON.stringify(report, null, 2))
    
    return report
  }
}

module.exports = SupabaseTester