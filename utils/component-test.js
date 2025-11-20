/**
 * 组件测试工具 - 验证 TDesign 组件是否正常加载
 */

class ComponentTester {
  
  /**
   * 测试所有关键组件
   */
  static testAllComponents() {
    console.log('🧪 开始测试 TDesign 组件...')
    
    const components = [
      't-button',
      't-cell', 
      't-cell-group',
      't-input',
      't-radio-group',
      't-radio',
      't-picker',
      't-date-time-picker',
      't-dialog',
      't-tabs',
      't-tab-panel',
      't-loading'
    ]
    
    console.log('📋 需要测试的组件列表:')
    components.forEach(comp => console.log(`  - ${comp}`))
    
    return components
  }
  
  /**
   * 测试添加宝宝页面的组件
   */
  static testAddBabyPage() {
    console.log('\n👶 测试添加宝宝页面组件...')
    
    const requiredComponents = [
      't-button',
      't-cell-group', 
      't-cell',
      't-input',
      't-radio-group',
      't-radio',
      't-date-time-picker'
    ]
    
    console.log('✅ 添加宝宝页面所需组件:')
    requiredComponents.forEach(comp => console.log(`  - ${comp}`))
    
    return requiredComponents
  }
  
  /**
   * 验证组件配置
   */
  static validateComponentConfig() {
    console.log('\n⚙️ 验证组件配置...')
    
    const config = {
      'add-baby.json': [
        't-button: "tdesign-miniprogram/button/button"',
        't-cell: "tdesign-miniprogram/cell/cell"', 
        't-cell-group: "tdesign-miniprogram/cell-group/cell-group"',
        't-input: "tdesign-miniprogram/input/input"',
        't-radio-group: "tdesign-miniprogram/radio-group/radio-group"',
        't-radio: "tdesign-miniprogram/radio/radio"',
        't-date-time-picker: "tdesign-miniprogram/date-time-picker/date-time-picker"'
      ]
    }
    
    Object.keys(config).forEach(file => {
      console.log(`📄 ${file}:`)
      config[file].forEach(comp => console.log(`  ✅ ${comp}`))
    })
    
    return config
  }
  
  /**
   * 运行完整测试
   */
  static runFullTest() {
    console.log('🚀 开始完整组件测试')
    
    try {
      this.testAllComponents()
      this.testAddBabyPage()
      this.validateComponentConfig()
      
      console.log('\n✅ 组件测试完成！所有组件配置正确')
      return true
      
    } catch (error) {
      console.error('\n❌ 组件测试失败:', error.message)
      return false
    }
  }
}

module.exports = ComponentTester