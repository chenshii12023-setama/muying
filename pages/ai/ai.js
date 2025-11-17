const app = getApp()

Page({
  data: {
    activeTab: 'chat',
    inputMessage: '',
    messages: [],
    quickQuestions: [
      '宝宝发烧怎么办？',
      '辅食添加时间表',
      '如何训练宝宝睡眠？',
      '疫苗接种注意事项'
    ],
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
    this.loadDefaultMessages()
  },

  loadBabyInfo: function() {
    const babyInfo = app.getBabyInfo()
    if (babyInfo) {
      this.setData({
        babyAge: babyInfo.age || 6,
        babyWeight: babyInfo.weight || 7.5
      })
    }
  },

  loadDefaultMessages: function() {
    const defaultMessages = [
      {
        id: 1,
        role: 'ai',
        content: '您好！我是您的AI育儿助手，可以为您解答各种育儿问题，包括宝宝健康、营养、发育等方面的问题。',
        time: this.formatTime(new Date())
      }
    ]
    
    this.setData({
      messages: defaultMessages
    })
  },

  onTabChange: function(e) {
    this.setData({
      activeTab: e.detail.value
    })
  },

  onInputChange: function(e) {
    this.setData({
      inputMessage: e.detail.value
    })
  },

  sendMessage: function() {
    const message = this.data.inputMessage.trim()
    if (!message) return

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      time: this.formatTime(new Date())
    }

    const messages = [...this.data.messages, userMessage]
    this.setData({
      messages: messages,
      inputMessage: ''
    })

    // 模拟AI回复
    this.simulateAIResponse(message)
  },

  simulateAIResponse: function(userMessage) {
    // 模拟AI思考时间
    setTimeout(() => {
      let aiResponse = ''
      
      // 简单的关键词匹配回复
      if (userMessage.includes('发烧')) {
        aiResponse = '宝宝发烧时，建议：1. 测量体温，38.5℃以下物理降温；2. 保持室内通风；3. 多喝水；4. 观察精神状态。如持续高热请及时就医。'
      } else if (userMessage.includes('辅食')) {
        aiResponse = '辅食添加建议：\n• 6个月：单一食材米糊\n• 7-8个月：蔬菜泥、水果泥\n• 9-10个月：肉泥、蛋黄\n• 11-12个月：软饭、小块食物'
      } else if (userMessage.includes('睡眠')) {
        aiResponse = '宝宝睡眠训练方法：\n1. 建立固定作息时间\n2. 睡前仪式（洗澡、故事）\n3. 让宝宝学会自主入睡\n4. 保持安静舒适的睡眠环境'
      } else if (userMessage.includes('疫苗')) {
        aiResponse = '疫苗接种注意事项：\n• 接种前确保宝宝健康\n• 接种后观察30分钟\n• 注意局部反应和发热\n• 按计划完成所有疫苗接种'
      } else {
        aiResponse = '感谢您的提问！关于这个问题，我建议您：\n1. 参考权威育儿书籍\n2. 咨询专业儿科医生\n3. 观察宝宝的具体表现\n4. 如有异常及时就医'
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: aiResponse,
        time: this.formatTime(new Date())
      }

      const messages = [...this.data.messages, aiMessage]
      this.setData({
        messages: messages
      })

      // 滚动到最新消息
      this.scrollToBottom()
    }, 1000)
  },

  askQuickQuestion: function(e) {
    const question = e.currentTarget.dataset.question
    this.setData({
      inputMessage: question
    })
    this.sendMessage()
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