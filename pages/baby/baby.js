const app = getApp()

Page({
  data: {
    // 页面状态
    showAddForm: false,
    activeTab: 'info',
    showBabySelector: false,
    
    // 添加表单数据
    name: '',
    gender: 'male',
    birthDate: '',
    bloodType: 'A',
    birthHeight: '',
    birthWeight: '',
    isSaving: false,
    
    // 展示数据
    currentBaby: null,
    currentBabyIndex: 0,
    babies: [],
    
    // 指标
    currentWeight: '-',
    currentHeight: '-',
    currentHead: '-'
  },

  onLoad: function(options) {
    if (options.tab) {
      this.setData({ activeTab: options.tab })
    }
    const today = new Date().toISOString().split('T')[0]
    this.setData({ birthDate: today })
    this.loadBabyData()
  },

  onShow: function() {
    this.loadBabyData()
  },

  // 1. 加载主入口
  async loadBabyData() {
    try {
      // 优先从网络加载
      const babies = await this.loadBabiesFromNetwork()
      
      if (babies && babies.length > 0) {
        this.setData({ 
          babies: babies,
          currentBabyIndex: 0,
          currentBaby: babies[0], 
          showAddForm: false 
        })
        
        console.log('✅ 界面渲染数据:', this.data.currentBaby) // 调试日志
        this.updateGrowthDisplay()
      } else {
        // 网络无数据，尝试本地
        const localBabies = wx.getStorageSync('babies') || []
        if (localBabies.length > 0) {
           this.setData({
             babies: localBabies,
             currentBabyIndex: 0,
             currentBaby: localBabies[0],
             showAddForm: false
           })
           this.updateGrowthDisplay()
        } else {
           this.setData({ showAddForm: true, babies: [] })
        }
      }
    } catch (error) {
      console.error('加载出错:', error)
      this.setData({ showAddForm: true })
    }
  },

  // 2. 从网络加载并转换数据格式
  async loadBabiesFromNetwork() {
    const profileId = app.globalData.userProfile?.id || app.globalData.userProfile?.user_id
    if (!profileId) return []

    try {
      const result = await new Promise((resolve, reject) => {
        wx.request({
          url: `https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies?profile_id=eq.${profileId}&select=*&order=created_at.desc`,
          method: 'GET',
          header: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
          },
          success: resolve,
          fail: reject
        })
      })

      if (result.statusCode === 200 && result.data) {
        // 数据映射：将下划线字段转为驼峰，并预计算显示字符串
        const processedBabies = result.data.map(baby => {
            const dob = baby.birth_date || baby.birthDate || '';
            const bWeight = baby.birth_weight || baby.birthWeight;
            const bHeight = baby.birth_height || baby.birthHeight;
            const bHead = baby.head_size || baby.headSize;

            return {
                ...baby,
                // 统一字段
                birthDate: dob,
                bloodType: baby.blood_type || baby.bloodType,
                
                // 预计算显示文本 (WXML直接用这些)
                genderStr: this.formatGender(baby.gender),
                ageStr: this.calculateAgeStr(dob),
                
                displayWeight: bWeight ? bWeight + ' kg' : '-',
                displayHeight: bHeight ? bHeight + ' cm' : '-',
                displayHead: bHead ? bHead + ' cm' : '-'
            }
        })
        
        app.globalData.babies = processedBabies
        wx.setStorageSync('babies', processedBabies)
        return processedBabies
      }
      return []
    } catch (error) {
      console.error('网络请求失败:', error)
      return []
    }
  },

  // 3. 更新指标显示
  updateGrowthDisplay() {
      const baby = this.data.currentBaby;
      if (!baby) return;

      this.setData({
          currentWeight: baby.displayWeight || '-',
          currentHeight: baby.displayHeight || '-',
          currentHead: baby.displayHead || '-'
      })
      
      // TODO: 这里可以调用查询 growth_records 表的接口获取最新数据覆盖上面的值
  },

  // 辅助函数
  calculateAgeStr(dateStr) {
    if (!dateStr) return '未知'
    const birth = new Date(dateStr)
    const now = new Date()
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    if (now.getDate() < birth.getDate()) months--
    
    if (months < 0) return '未出生'
    if (months === 0) {
        const diffTime = Math.abs(now - birth);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays + '天'
    }
    if (months < 12) return `${months}个月`
    const years = Math.floor(months / 12)
    const extraMonths = months % 12
    return extraMonths > 0 ? `${years}岁${extraMonths}个月` : `${years}岁`
  },

  formatGender(gender) {
    if (gender === 'male' || gender === '男') return '男宝宝'
    if (gender === 'female' || gender === '女') return '女宝宝'
    return '未知'
  },

  // 交互函数
  onTabChange(e) { this.setData({ activeTab: e.detail.value }) },
  showAddForm() { this.setData({ showAddForm: true }) },
  showBabySelector() { this.setData({ showBabySelector: true }) },
  hideBabySelector() { this.setData({ showBabySelector: false }) },
  
  selectBaby(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ 
      currentBabyIndex: index, 
      currentBaby: this.data.babies[index],
      showBabySelector: false 
    })
    this.updateGrowthDisplay()
  },

  onNameInput(e) { this.setData({ name: e.detail.value }) },
  onGenderChange(e) { this.setData({ gender: e.detail.value }) },
  onDateChange(e) { this.setData({ birthDate: e.detail.value }) },

  async saveBaby() {
    if (!this.data.name.trim()) return wx.showToast({ title: '请输入姓名', icon: 'none' })
    if (!this.data.birthDate) return wx.showToast({ title: '请选择日期', icon: 'none' })
    
    this.setData({ isSaving: true })
    
    try {
      const profileId = app.globalData.userProfile?.id || app.globalData.userProfile?.user_id
      const babyData = {
        name: this.data.name.trim(),
        gender: this.data.gender,
        birth_date: this.data.birthDate,
        birth_weight: this.data.birthWeight ? parseFloat(this.data.birthWeight) : null,
        birth_height: this.data.birthHeight ? parseFloat(this.data.birthHeight) : null,
        profile_id: profileId,
        created_at: new Date().toISOString()
      }
      
      const result = await new Promise((resolve) => {
        wx.request({
          url: 'https://zbhlrnecjmdpuaxvhneu.supabase.co/rest/v1/babies',
          method: 'POST',
          header: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaGxybmVjam1kcHVheHZobmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODYxMTAsImV4cCI6MjA3OTE2MjExMH0.xBAXaZkNJyFEOrZRHqejFbttujsmgn3o5rgMwkTO_3o',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          data: babyData,
          success: resolve
        })
      })
      
      if (result.statusCode === 201 || result.statusCode === 200) {
        wx.showToast({ title: '保存成功' })
        this.setData({ name: '', isSaving: false })
        await this.loadBabyData()
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      console.error(error)
      wx.showToast({ title: '保存失败', icon: 'none' })
      this.setData({ isSaving: false })
    }
  },

  editCurrentBaby() {
      if (this.data.currentBaby) {
          wx.navigateTo({ url: `/pages/baby/edit-baby?id=${this.data.currentBaby.id}` })
      }
  },
  
  addRecord() { wx.navigateTo({ url: '/pages/growth/add' }) },
  goToAddBaby() { this.setData({ showAddForm: true, showBabySelector: false }) }
})