/**
 * 测试脚本 - 验证后端连接和全局数据流
 */

const app = getApp()

class ConnectionTester {
  
  /**
   * 运行完整测试流程
   */
  static async runFullTest() {
    console.log('🚀 开始测试基础架构和数据流')
    
    try {
      // 测试1: 后端连接测试
      await this.testBackendConnection()
      
      // 测试2: 用户登录流程
      await this.testUserLogin()
      
      // 测试3: 宝宝管理
      await this.testBabyManagement()
      
      // 测试4: 数据持久化
      await this.testDataPersistence()
      
      console.log('✅ 所有测试通过！基础架构运行正常')
      return true
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message)
      return false
    }
  }
  
  /**
   * 测试后端连接
   */
  static async testBackendConnection() {
    console.log('\n📡 测试后端连接...')
    
    try {
      const useLocalStorage = await app.globalData.supabase.testConnection()
      
      if (useLocalStorage) {
        console.log('✅ 本地存储模式正常')
      } else {
        console.log('✅ Supabase后端连接正常')
        
        // 测试API调用
        const recipes = await app.globalData.supabase.getBabyFoodRecipes()
        console.log(`✅ API调用成功，获取到${recipes.length}个食谱`)
      }
      
      return true
    } catch (error) {
      console.log('❌ 后端连接测试失败:', error.message)
      throw error
    }
  }
  
  /**
   * 测试用户登录流程
   */
  static async testUserLogin() {
    console.log('\n👤 测试用户登录流程...')
    
    try {
      // 模拟用户信息
      const testUser = {
        id: 'test_user_' + Date.now(),
        userId: 'test_user_' + Date.now(),
        nickName: '测试用户',
        phoneNumber: '13800138000',
        avatar: '/images/default-avatar.png',
        loginType: 'phone'
      }
      
      // 测试登录成功处理
      const loginSuccess = await app.onLoginSuccess(testUser, 'test_token_' + Date.now())
      
      if (loginSuccess) {
        console.log('✅ 用户登录流程正常')
        console.log('✅ 用户信息已保存到全局状态')
        console.log('✅ Token已保存')
        console.log('✅ 本地存储已更新')
      } else {
        throw new Error('登录处理失败')
      }
      
      // 验证全局状态
      const userInfo = app.getUserInfo()
      const userProfile = app.getUserProfile()
      const token = app.getToken()
      const isLoggedIn = app.isLoggedIn()
      
      if (userInfo && userProfile && token && isLoggedIn) {
        console.log('✅ 全局状态验证通过')
      } else {
        throw new Error('全局状态不完整')
      }
      
      return true
    } catch (error) {
      console.log('❌ 用户登录测试失败:', error.message)
      throw error
    }
  }
  
  /**
   * 测试宝宝管理
   */
  static async testBabyManagement() {
    console.log('\n👶 测试宝宝管理...')
    
    try {
      // 创建测试宝宝数据
      const testBabyData = {
        name: '测试宝宝',
        gender: 'male',
        birthDate: '2024-01-01',
        weight: 3.5,
        height: 52,
        bloodType: 'A'
      }
      
      // 测试添加宝宝
      const newBaby = await app.addBaby(testBabyData)
      
      if (newBaby && newBaby.id) {
        console.log('✅ 宝宝添加成功，ID:', newBaby.id)
        console.log('✅ 宝宝信息已更新到全局状态')
      } else {
        throw new Error('宝宝添加失败')
      }
      
      // 验证当前宝宝
      const currentBaby = app.getCurrentBaby()
      const babies = app.getBabies()
      
      if (currentBaby && currentBaby.id === newBaby.id && babies.length > 0) {
        console.log('✅ 当前宝宝设置正确')
        console.log('✅ 宝宝列表更新正确')
      } else {
        throw new Error('宝宝状态管理失败')
      }
      
      // 测试宝宝信息更新
      const updateData = { weight: 4.0, height: 55 }
      const updatedBaby = await app.updateBabyInfo(newBaby.id, updateData)
      
      if (updatedBaby && updatedBaby.weight === 4.0) {
        console.log('✅ 宝宝信息更新成功')
      } else {
        throw new Error('宝宝信息更新失败')
      }
      
      return true
    } catch (error) {
      console.log('❌ 宝宝管理测试失败:', error.message)
      throw error
    }
  }
  
  /**
   * 测试数据持久化
   */
  static async testDataPersistence() {
    console.log('\n💾 测试数据持久化...')
    
    try {
      // 检查本地存储
      const userInfo = wx.getStorageSync('userInfo')
      const token = wx.getStorageSync('token')
      const currentBaby = wx.getStorageSync('currentBaby')
      
      if (userInfo && token && currentBaby) {
        console.log('✅ 本地存储数据正常')
      } else {
        throw new Error('本地存储数据缺失')
      }
      
      // 测试数据恢复
      await app.checkLoginStatus()
      
      const restoredUserInfo = app.getUserInfo()
      const restoredBaby = app.getCurrentBaby()
      const restoredIsLoggedIn = app.isLoggedIn()
      
      if (restoredUserInfo && restoredBaby && restoredIsLoggedIn) {
        console.log('✅ 数据恢复正常')
      } else {
        throw new Error('数据恢复失败')
      }
      
      // 测试应用状态
      const appStatus = app.getAppStatus()
      console.log('📊 应用状态:', appStatus)
      
      if (appStatus.isLoggedIn && appStatus.hasBaby) {
        console.log('✅ 应用状态正常')
      } else {
        throw new Error('应用状态异常')
      }
      
      return true
    } catch (error) {
      console.log('❌ 数据持久化测试失败:', error.message)
      throw error
    }
  }
  
  /**
   * 快速测试（仅关键功能）
   */
  static async quickTest() {
    console.log('⚡ 开始快速测试...')
    
    try {
      // 仅测试最关键的功能
      await this.testBackendConnection()
      
      // 检查关键状态
      const isLoggedIn = app.isLoggedIn()
      const hasBaby = !!app.getCurrentBaby()
      
      console.log('📊 快速测试结果:')
      console.log('- 登录状态:', isLoggedIn)
      console.log('- 宝宝信息:', hasBaby)
      
      return true
    } catch (error) {
      console.error('快速测试失败:', error.message)
      return false
    }
  }
}

module.exports = ConnectionTester