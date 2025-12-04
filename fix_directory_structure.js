const fs = require('fs')
const path = require('path')

/**
 * 修复TDesign组件目录结构
 * 确保每个组件都有自己的目录
 */

const MINIPROGRAM_NPM_DIR = path.join(__dirname, 'miniprogram_npm')
const TDESIGN_DIR = path.join(MINIPROGRAM_NPM_DIR, 'tdesign-miniprogram', 'miniprogram_dist')

console.log('🔧 修复TDesign组件目录结构...')

// 获取所有需要修复的组件
const componentFiles = fs.readdirSync(TDESIGN_DIR).filter(name => {
  const stat = fs.statSync(path.join(TDESIGN_DIR, name))
  return stat.isFile() && (name.endsWith('.js') || name.endsWith('.json'))
})

console.log(`📁 找到 ${componentFiles.length} 个组件文件`)

// 创建组件目录并移动文件
const componentNames = []

componentFiles.forEach(file => {
  // 提取组件名 (button.js -> button)
  const componentName = path.basename(file, '.js')
  if (!componentNames.includes(componentName)) {
    componentNames.push(componentName)
  }
})

componentNames.forEach(componentName => {
  const componentDir = path.join(TDESIGN_DIR, componentName)
  
  // 创建组件目录
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true })
    console.log(`📂 创建目录: ${componentName}`)
  }
  
  // 移动相关文件到组件目录
  const files = ['js', 'json', 'wxml', 'wxss', 'd.ts']
  files.forEach(ext => {
    const sourceFile = path.join(TDESIGN_DIR, `${componentName}.${ext}`)
    const targetFile = path.join(componentDir, `${componentName}.${ext}`)
    
    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, targetFile)
      console.log(`📄 复制: ${componentName}.${ext}`)
    }
  })
  
  // 复制index.js文件（如果存在）
  const indexSource = path.join(TDESIGN_DIR, 'index.js')
  const indexTarget = path.join(componentDir, 'index.js')
  if (fs.existsSync(indexSource)) {
    fs.copyFileSync(indexSource, indexTarget)
  }
})

console.log('\n✅ 目录结构修复完成！')

// 验证修复结果
console.log('\n🔍 验证组件结构:')
const requiredComponents = [
  'button', 'cell', 'cell-group', 'input', 'dialog', 
  'message', 'loading', 'icon', 'divider', 'radio', 'radio-group'
]

requiredComponents.forEach(component => {
  const componentDir = path.join(TDESIGN_DIR, component)
  const componentFile = path.join(componentDir, `${component}.js`)
  
  if (fs.existsSync(componentFile)) {
    console.log(`✅ ${component}`)
  } else {
    console.log(`❌ ${component}`)
  }
})

console.log('\n📝 正确的组件路径示例:')
console.log('  "t-button": "tdesign-miniprogram/miniprogram_dist/button/button",')
console.log('  "t-cell": "tdesign-miniprogram/miniprogram_dist/cell/cell",')