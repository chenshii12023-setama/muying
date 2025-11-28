const app = getApp()

Page({
  data: {
    activeTab: 'assessment',
    
    // 成长评估相关数据
    babyInfo: null,
    growthData: {
      age: 0,
      gender: '',
      height: 0,
      weight: 0
    },
    assessmentResult: null,
    isAssessing: false,
    
    // 营养计算相关数据（保留原有功能）
    babyAge: 6,
    babyWeight: 7.5,
    ingredients: [
      { id: 1, name: '米糊', icon: '🍚', selected: false, amount: 50 },
      { id: 2, name: '胡萝卜', icon: '🥕', selected: false, amount: 30 },
      { id: 3, name: '苹果', icon: '🍎', selected: false, amount: 50 },
      { id: 4, name: '鸡蛋', icon: '🥚', selected: false, amount: 30 },
      { id: 5, name: '菠菜', icon: '🥬', selected: false, amount: 30 },
      { id: 6, name: '牛肉', icon: '🥩', selected: false, amount: 30 },
      { id: 7, name: '鱼肉', icon: '🐟', selected: false, amount: 30 },
      { id: 8, name: '土豆', icon: '🥔', selected: false, amount: 50 }
    ],
    selectedIngredients: [],
    nutritionResult: null
  },

  onLoad: function(options) {
    if (options.tab) {
      this.setData({
        activeTab: options.tab
      })
    }
    
    this.loadBabyInfo()
  },

  loadBabyInfo: function() {
    const babyInfo = app.getBabyInfo()
    if (babyInfo) {
      // 计算宝宝年龄（月）
      const ageInMonths = this.calculateAgeInMonths(babyInfo.birthDate || babyInfo.birth_date)
      
      this.setData({
        babyInfo: babyInfo,
        babyAge: ageInMonths || 6,
        babyWeight: babyInfo.current_weight || babyInfo.weight || 7.5,
        growthData: {
          age: ageInMonths || 6,
          gender: babyInfo.gender === 'male' ? 'boy' : 'girl',
          height: babyInfo.current_height || 0,
          weight: babyInfo.current_weight || 0
        }
      })
    }
  },

  onTabChange: function(e) {
    this.setData({
      activeTab: e.detail.value
    })
  },

  // 成长评估相关方法
  onGrowthDataChange: function(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    
    this.setData({
      [`growthData.${field}`]: value
    })
  },

  // 计算宝宝年龄（月）
  calculateAgeInMonths: function(birthDate) {
    if (!birthDate) return 0
    
    const birth = new Date(birthDate)
    const now = new Date()
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    if (now.getDate() < birth.getDate()) months--
    
    return months < 0 ? 0 : months
  },

  // 发起成长评估
  startGrowthAssessment: function() {
    const { age, gender, height, weight } = this.data.growthData
    
    if (!age || age <= 0) {
      wx.showToast({ title: '请输入宝宝年龄', icon: 'none' })
      return
    }
    
    if (!height || height <= 0) {
      wx.showToast({ title: '请输入宝宝身高', icon: 'none' })
      return
    }
    
    if (!weight || weight <= 0) {
      wx.showToast({ title: '请输入宝宝体重', icon: 'none' })
      return
    }
    
    if (!gender) {
      wx.showToast({ title: '请选择宝宝性别', icon: 'none' })
      return
    }
    
    this.setData({ isAssessing: true })
    
    // 构建请求数据
    const assessmentData = {
      gender: gender,
      age: parseInt(age),
      height: parseFloat(height),
      weight: parseFloat(weight)
    }
    
    console.log('发送成长评估数据:', assessmentData)
    
    // 调用n8n webhook
    this.callGrowthAssessmentWebhook(assessmentData)
  },

  // 调用n8n webhook进行成长评估
  callGrowthAssessmentWebhook: function(assessmentData) {
    wx.request({
      url: 'http://localhost:5678/webhook/Growth-Assessment',
      method: 'POST',
      data: assessmentData,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('成长评估API响应:', res)
        
        if (res.statusCode === 200) {
          // 解析AI返回的评估结果
          this.handleAssessmentResult(res.data)
        } else {
          wx.showToast({ title: '评估请求失败', icon: 'none' })
          this.setData({ isAssessing: false })
        }
      },
      fail: (err) => {
        console.error('成长评估请求失败:', err)
        wx.showToast({ title: '网络连接失败', icon: 'none' })
        this.setData({ isAssessing: false })
        
        // 降级到本地模拟评估
        this.simulateLocalAssessment(assessmentData)
      }
    })
  },

  // 处理AI返回的评估结果
  handleAssessmentResult: function(result) {
    try {
      const assessmentResult = {
        analysis: result.analysis || '未能获取发育分析',
        advice: result.advice || '未能获取专业建议',
        timestamp: new Date().toLocaleString()
      }
      
      this.setData({
        assessmentResult: assessmentResult,
        isAssessing: false
      })
      
      wx.showToast({ title: '评估完成', icon: 'success' })
    } catch (error) {
      console.error('解析评估结果失败:', error)
      wx.showToast({ title: '评估结果解析失败', icon: 'none' })
      this.setData({ isAssessing: false })
    }
  },

  // 本地模拟评估（降级方案）
  simulateLocalAssessment: function(assessmentData) {
    const { age, gender, height, weight } = assessmentData
    
    // 简单的本地评估逻辑
    let analysis = ''
    let advice = ''
    
    if (age <= 12) {
      // 1岁以下婴儿评估
      const heightPercentile = this.calculatePercentile(height, age, gender, 'height')
      const weightPercentile = this.calculatePercentile(weight, age, gender, 'weight')
      
      analysis = `根据WHO ${age}个月${gender === 'boy' ? '男宝' : '女宝'}生长标准，您的宝宝身高${height}厘米处于${heightPercentile}百分位，体重${weight}公斤处于${weightPercentile}百分位。`
      
      if (heightPercentile >= 75 && weightPercentile >= 75) {
        analysis += '发育状况优秀，身高体重比例协调。'
        advice = '建议继续保持均衡营养，适当添加辅食，保证充足睡眠，鼓励宝宝进行大动作训练。'
      } else if (heightPercentile >= 25 && weightPercentile >= 25) {
        analysis += '发育状况良好，符合正常生长曲线。'
        advice = '建议继续观察，如有异常及时就医。'
      } else {
        analysis += '发育状况需要关注，建议咨询专业医生。'
        advice = '建议及时就医检查，调整喂养方式。'
      }
    } else {
      // 1岁以上幼儿评估
      analysis = `根据幼儿生长标准，您的${gender === 'boy' ? '男宝' : '女宝'}身高${height}厘米，体重${weight}公斤。`
      advice = '建议定期监测生长发育指标，保持均衡饮食和适当运动。'
    }
    
    const assessmentResult = {
      analysis: analysis,
      advice: advice,
      timestamp: new Date().toLocaleString(),
      isLocal: true
    }
    
    this.setData({
      assessmentResult: assessmentResult,
      isAssessing: false
    })
    
    wx.showToast({ title: '本地评估完成', icon: 'success' })
  },

  // 计算百分位（简化版）
  calculatePercentile: function(value, age, gender, type) {
    // 简化的百分位计算，实际应用中应该使用更精确的WHO标准数据
    const baseValue = type === 'height' ? 50 + age * 2 : 3 + age * 0.5
    const ratio = value / baseValue
    
    if (ratio >= 1.2) return '97-100'
    if (ratio >= 1.1) return '85-97'
    if (ratio >= 1.0) return '50-85'
    if (ratio >= 0.9) return '15-50'
    if (ratio >= 0.8) return '3-15'
    return '0-3'
  },

  // 重新评估
  reassess: function() {
    this.setData({
      assessmentResult: null
    })
  },

  // 跳转到添加宝宝页面
  goToAddBaby: function() {
    wx.navigateTo({
      url: '/pages/baby/baby'
    })
  },

  toggleIngredient: function(e) {
    const id = e.currentTarget.dataset.id
    const ingredients = this.data.ingredients.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected }
      }
      return item
    })

    const selectedIngredients = ingredients.filter(item => item.selected)
    
    this.setData({
      ingredients: ingredients,
      selectedIngredients: selectedIngredients
    })
  },

  onAmountChange: function(e) {
    const id = e.currentTarget.dataset.id
    const amount = e.detail.value
    
    const ingredients = this.data.ingredients.map(item => {
      if (item.id === id) {
        return { ...item, amount: amount }
      }
      return item
    })

    const selectedIngredients = ingredients.filter(item => item.selected)
    
    this.setData({
      ingredients: ingredients,
      selectedIngredients: selectedIngredients
    })
  },

  calculateNutrition: function() {
    if (this.data.selectedIngredients.length === 0) {
      wx.showToast({
        title: '请选择至少一种食材',
        icon: 'none'
      })
      return
    }

    // 模拟营养计算
    const totalCalories = this.data.selectedIngredients.reduce((sum, item) => {
      return sum + (item.amount * 0.8) // 简化计算
    }, 0)

    const nutritionResult = {
      calories: Math.round(totalCalories),
      protein: Math.round(totalCalories * 0.15),
      carbs: Math.round(totalCalories * 0.6),
      fat: Math.round(totalCalories * 0.25),
      recommendation: this.getNutritionRecommendation(totalCalories)
    }

    this.setData({
      nutritionResult: nutritionResult
    })
  },

  getNutritionRecommendation: function(calories) {
    const age = this.data.babyAge
    
    if (age <= 6) {
      return `当前热量${calories}kcal，适合6个月以下宝宝，建议继续观察宝宝反应，如有过敏立即停止。`
    } else if (age <= 12) {
      if (calories < 200) {
        return `热量稍低，建议增加食材种类或用量，适合7-12个月宝宝。`
      } else if (calories > 400) {
        return `热量偏高，建议适量减少用量，避免过量喂养。`
      } else {
        return `营养配比合理，适合7-12个月宝宝，可继续按此标准喂养。`
      }
    } else {
      return `营养计算完成，适合1岁以上宝宝，可根据宝宝食欲适当调整。`
    }
  },

  resetCalculator: function() {
    const ingredients = this.data.ingredients.map(item => ({
      ...item,
      selected: false,
      amount: item.id <= 3 ? 50 : 30 // 重置为默认值
    }))

    this.setData({
      ingredients: ingredients,
      selectedIngredients: [],
      nutritionResult: null
    })
  },

  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  },

  scrollToBottom: function() {
    // 在微信小程序中，需要手动实现滚动到最新消息
    setTimeout(() => {
      wx.pageScrollTo({
        scrollTop: 99999,
        duration: 300
      })
    }, 100)
  }
})