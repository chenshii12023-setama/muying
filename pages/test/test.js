// pages/test/test.js
const app = getApp()

Page({
  data: {
    testResults: [],
    isLoading: false,
    backendConnected: false
  },

  onLoad: function(options) {
    this.setData({
      backendConnected: app.globalData.backendConnected || false
    })
    
    // 自动运行测试
    if (this.data.backendConnected) {
      this.runAllTests()
    }
  },

  // 运行所有测试
  runAllTests: function() {
    this.setData({ isLoading: true, testResults: [] })
    
    const tests = [
      this.testRecipesAPI.bind(this),
      this.testFacilitiesAPI.bind(this),
      this.testMarketItemsAPI.bind(this)
    ]
    
    this.runTestsSequentially(tests)
  },

  // 顺序运行测试
  runTestsSequentially: function(tests) {
    if (tests.length === 0) {
      this.setData({ isLoading: false })
      return
    }
    
    const test = tests[0]
    test().then(() => {
      this.runTestsSequentially(tests.slice(1))
    }).catch(error => {
      console.error('测试失败:', error)
      this.runTestsSequentially(tests.slice(1))
    })
  },

  // 测试辅食食谱API
  testRecipesAPI: function() {
    return new Promise((resolve, reject) => {
      this.addTestResult('辅食食谱API', '正在测试...', 'pending')
      
      app.globalData.supabase.getBabyFoodRecipes({})
        .then(recipes => {
          this.addTestResult('辅食食谱API', `成功获取 ${recipes.length} 条食谱`, 'success', recipes)
          resolve()
        })
        .catch(error => {
          this.addTestResult('辅食食谱API', `失败: ${error.message}`, 'error', null)
          reject(error)
        })
    })
  },

  // 测试母婴设施API
  testFacilitiesAPI: function() {
    return new Promise((resolve, reject) => {
      this.addTestResult('母婴设施API', '正在测试...', 'pending')
      
      // 测试获取附近设施（使用默认坐标）
      app.globalData.supabase.getNearbyFacilities(31.2304, 121.4737, 5)
        .then(facilities => {
          this.addTestResult('母婴设施API', `成功获取 ${facilities.length} 个设施`, 'success', facilities)
          resolve()
        })
        .catch(error => {
          this.addTestResult('母婴设施API', `失败: ${error.message}`, 'error', null)
          reject(error)
        })
    })
  },

  // 测试闲置物品API
  testMarketItemsAPI: function() {
    return new Promise((resolve, reject) => {
      this.addTestResult('闲置物品API', '正在测试...', 'pending')
      
      app.globalData.supabase.getSecondhandItems({})
        .then(items => {
          this.addTestResult('闲置物品API', `成功获取 ${items.length} 件物品`, 'success', items)
          resolve()
        })
        .catch(error => {
          this.addTestResult('闲置物品API', `失败: ${error.message}`, 'error', null)
          reject(error)
        })
    })
  },

  // 添加测试结果
  addTestResult: function(testName, message, status, data = null) {
    const result = {
      name: testName,
      message: message,
      status: status,
      time: new Date().toLocaleTimeString(),
      data: data
    }
    
    this.setData({
      testResults: [...this.data.testResults, result]
    })
  },

  // 手动运行测试
  runTests: function() {
    this.setData({
      backendConnected: app.globalData.backendConnected || false
    })
    
    if (this.data.backendConnected) {
      this.runAllTests()
    } else {
      wx.showModal({
        title: '后端未连接',
        content: '请先确保后端连接正常',
        showCancel: false
      })
    }
  },

  // 查看测试详情
  viewTestDetails: function(e) {
    const index = e.currentTarget.dataset.index
    const result = this.data.testResults[index]
    
    if (result.data) {
      wx.showModal({
        title: `${result.name} - 详情`,
        content: JSON.stringify(result.data, null, 2).substring(0, 500) + '...',
        showCancel: false
      })
    } else {
      wx.showModal({
        title: result.name,
        content: result.message,
        showCancel: false
      })
    }
  },

  // 复制测试结果
  copyTestResults: function() {
    const resultsText = this.data.testResults.map(r => 
      `${r.time} - ${r.name}: ${r.message} (${r.status})`
    ).join('\n')
    
    wx.setClipboardData({
      data: resultsText,
      success: () => {
        wx.showToast({
          title: '结果已复制',
          icon: 'success'
        })
      }
    })
  },

  // 返回首页
  goBack: function() {
    wx.navigateBack()
  }
})