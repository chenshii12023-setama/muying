const app = getApp()

Page({
  data: {
    // 页面状态
    showAddForm: false,
    activeTab: 'info',
    showBabySelector: false,
    
    // --- 添加表单数据 ---
    name: '',
    gender: 'male', // 默认选中男宝
    birthDate: '',
    
    // 血型相关
    bloodType: '', 
    bloodTypeIndex: null, 
    bloodTypeOptions: ['A', 'B', 'AB', 'O', '未知'], 
    
    // 身体指标 - 出生时
    birthHeight: '',
    birthWeight: '',
    
    // 当前身体指标（表单输入）
    currentHeightInput: '',
    currentWeightInput: '',
    
    isSaving: false,
    
    // --- 展示数据 ---
    currentBaby: null,
    currentBabyIndex: 0,
    babies: [],
    
    // --- 首页展示的最新指标 ---
    currentWeight: '-',
    currentHeight: '-'
  },

  onLoad: function(options) {
    if (options.tab) {
      this.setData({ activeTab: options.tab })
    }
    // 默认生日为今天
    const today = new Date().toISOString().split('T')[0]
    this.setData({ birthDate: today })
    
    this.loadBabyData()
  },

  onShow: function() {
    this.loadBabyData()
  },

  // ---------------------------------------------------------
  // 核心逻辑：加载数据
  // ---------------------------------------------------------
  async loadBabyData() {
    try {
      const babies = await this.loadBabiesFromNetwork()
      
      if (babies && babies.length > 0) {
        this.setData({ 
          babies: babies,
          currentBabyIndex: 0,
          currentBaby: babies[0], 
          showAddForm: false 
        })
        this.updateGrowthDisplay()
      } else {
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
        const processedBabies = result.data.map(baby => {
            const dob = baby.birth_date || baby.birthDate || '';
            const bWeight = baby.birth_weight || baby.birthWeight;
            const bHeight = baby.birth_height || baby.birthHeight;
            const cWeight = baby.current_weight || baby.currentWeight;
            const cHeight = baby.current_height || baby.currentHeight;

            return {
                ...baby,
                birthDate: dob,
                bloodType: baby.blood_type || baby.bloodType,
                
                genderStr: this.formatGender(baby.gender),
                ageStr: this.calculateAgeStr(dob),
                
                displayWeight: bWeight ? bWeight + ' kg' : '-',
                displayHeight: bHeight ? bHeight + ' cm' : '-',
                currentWeight: cWeight ? cWeight + ' kg' : '-',
                currentHeight: cHeight ? cHeight + ' cm' : '-'
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

  updateGrowthDisplay() {
      const baby = this.data.currentBaby;
      if (!baby) return;
      this.setData({
          currentWeight: baby.currentWeight || '-',
          currentHeight: baby.currentHeight || '-'
      })
  },

  // ---------------------------------------------------------
  // 表单交互处理 (这里是重点修改的部分)
  // ---------------------------------------------------------

  // 1. 姓名
  onNameInput(e) { this.setData({ name: e.detail.value }) },
  
  // 2. 性别 (🔥🔥🔥 这里修复了缺失的方法 🔥🔥🔥)
  // 专门用于处理原生View按钮的点击事件
  onGenderSelect(e) {
    const selectedGender = e.currentTarget.dataset.value;
    console.log('点击性别:', selectedGender);
    this.setData({ gender: selectedGender });
  },
  
  // 3. 日期
  onDateChange(e) { this.setData({ birthDate: e.detail.value }) },

  // 4. 血型
  onBloodTypeChange(e) {
    const index = parseInt(e.detail.value);
    const selectedType = this.data.bloodTypeOptions[index];
    this.setData({
      bloodTypeIndex: index,
      bloodType: selectedType
    })
  },

  // 5. 身体指标
  onBirthWeightInput(e) { this.setData({ birthWeight: e.detail.value }) },
  onBirthHeightInput(e) { this.setData({ birthHeight: e.detail.value }) },
  
  // 当前身体指标
  onCurrentWeightInput(e) { this.setData({ currentWeightInput: e.detail.value }) },
  onCurrentHeightInput(e) { this.setData({ currentHeightInput: e.detail.value }) },

  // ---------------------------------------------------------
  // 保存逻辑
  // ---------------------------------------------------------
  async saveBaby() {
    if (!this.data.name.trim()) return wx.showToast({ title: '请输入姓名', icon: 'none' })
    if (!this.data.birthDate) return wx.showToast({ title: '请选择日期', icon: 'none' })
    
    this.setData({ isSaving: true })
    
    try {
      const profileId = app.globalData.userProfile?.id || app.globalData.userProfile?.user_id
      
      // 血型映射：将中文转换为数据库字段
      const bloodTypeMap = {
        'A': 'A',
        'B': 'B', 
        'AB': 'AB',
        'O': 'O',
        '未知': 'unknown'
      }
      
      const babyData = {
        profile_id: profileId,
        name: this.data.name.trim(),
        gender: this.data.gender,
        birth_date: this.data.birthDate,
        blood_type: bloodTypeMap[this.data.bloodType] || null,
        birth_weight: this.data.birthWeight ? parseFloat(this.data.birthWeight) : null,
        birth_height: this.data.birthHeight ? parseFloat(this.data.birthHeight) : null,
        current_weight: this.data.currentWeightInput ? parseFloat(this.data.currentWeightInput) : null,
        current_height: this.data.currentHeightInput ? parseFloat(this.data.currentHeightInput) : null,
        created_at: new Date().toISOString()
      }
      
      console.log('提交数据:', babyData);

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
          success: (res) => {
            console.log('响应详情:', res);
            resolve(res);
          },
          fail: (err) => {
            console.error('请求失败:', err);
            resolve(err);
          }
        })
      })
      
      console.log('完整响应:', result);
      
      if (result.statusCode === 201 || result.statusCode === 200) {
        wx.showToast({ title: '保存成功' })
        // 清空表单
        this.setData({ 
            name: '', 
            birthWeight: '', 
            birthHeight: '', 
            currentWeightInput: '',
            currentHeightInput: '',
            bloodType: '', 
            bloodTypeIndex: null,
            isSaving: false 
        })
        await this.loadBabyData()
      } else {
        console.error('保存失败，状态码:', result.statusCode, '响应数据:', result.data);
        throw new Error(`保存失败: ${result.statusCode}`)
      }
    } catch (error) {
      console.error(error)
      wx.showToast({ title: '保存失败', icon: 'none' })
      this.setData({ isSaving: false })
    }
  },

  // ---------------------------------------------------------
  // 辅助函数
  // ---------------------------------------------------------
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

  editCurrentBaby() {
      if (this.data.currentBaby) {
          wx.navigateTo({ url: `/pages/baby/edit-baby?id=${this.data.currentBaby.id}` })
      }
  },
  
  addRecord() { wx.navigateTo({ url: '/pages/growth/add' }) },
  goToAddBaby() { this.setData({ showAddForm: true, showBabySelector: false }) }
})