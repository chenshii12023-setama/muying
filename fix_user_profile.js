/**
 * 修复用户配置文件中的ID格式问题
 * 清除错误的本地用户ID，使用正确的UUID格式
 */

// 清除错误的用户配置
function fixUserProfile() {
  try {
    // 清除现有的用户配置
    wx.removeStorageSync('userProfile')
    
    // 设置正确的用户配置
    const correctUserProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: '测试用户',
      nickname: '测试用户',
      avatar: '/images/default-avatar.png'
    }
    
    wx.setStorageSync('userProfile', correctUserProfile)
    
    console.log('✅ 用户配置已修复')
    console.log('新的用户ID:', correctUserProfile.id)
    
    wx.showToast({
      title: '用户配置已修复',
      icon: 'success'
    })
    
    return correctUserProfile
  } catch (error) {
    console.error('修复用户配置失败:', error)
    wx.showToast({
      title: '修复失败，请重试',
      icon: 'error'
    })
    return null
  }
}

// 检查用户配置
function checkUserProfile() {
  const userProfile = wx.getStorageSync('userProfile')
  
  if (!userProfile) {
    console.log('❌ 用户配置不存在')
    return false
  }
  
  if (!userProfile.id) {
    console.log('❌ 用户ID不存在')
    return false
  }
  
  // 检查UUID格式
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidPattern.test(userProfile.id)) {
    console.log('❌ 用户ID格式不正确:', userProfile.id)
    return false
  }
  
  console.log('✅ 用户配置正确')
  return true
}

// 主函数
function main() {
  console.log('🔍 检查用户配置...')
  
  if (checkUserProfile()) {
    console.log('🎉 用户配置正常，无需修复')
  } else {
    console.log('🔧 开始修复用户配置...')
    fixUserProfile()
  }
}

// 如果在小程序环境中运行
if (typeof wx !== 'undefined') {
  main()
}

module.exports = {
  fixUserProfile,
  checkUserProfile,
  main
}