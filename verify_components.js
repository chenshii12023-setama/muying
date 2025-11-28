const fs = require('fs')
const path = require('path')

/**
 * 验证TDesign组件是否正确构建
 */

const MINIPROGRAM_NPM_DIR = path.join(__dirname, 'miniprogram_npm')
const COMPONENTS_DIR = path.join(MINIPROGRAM_NPM_DIR, 'tdesign-miniprogram', 'miniprogram_dist')

// 从app.json中提取的组件列表
const requiredComponents = {
  "t-button": "button/button",
  "t-cell": "cell/cell", 
  "t-cell-group": "cell-group/cell-group",
  "t-grid": "grid/grid",
  "t-grid-item": "grid-item/grid-item",
  "t-input": "input/input",
  "t-tabs": "tabs/tabs",
  "t-tab-panel": "tab-panel/tab-panel",
  "t-upload": "upload/upload",
  "t-dialog": "dialog/dialog",
  "t-message": "message/message",
  "t-loading": "loading/loading",
  "t-icon": "icon/icon",
  "t-divider": "divider/divider",
  "t-radio": "radio/radio",
  "t-radio-group": "radio-group/radio-group"
}

console.log('🔍 验证TDesign组件构建情况...\n')

let missingCount = 0
let successCount = 0

for (const [componentName, componentPath] of Object.entries(requiredComponents)) {
  const fullPath = path.join(COMPONENTS_DIR, componentPath + '.js')
  const altPath = path.join(COMPONENTS_DIR, componentPath, 'index.js')
  
  let found = false
  let actualPath = ''
  
  if (fs.existsSync(fullPath)) {
    found = true
    actualPath = fullPath
  } else if (fs.existsSync(altPath)) {
    found = true
    actualPath = altPath
  }
  
  if (found) {
    console.log(`✅ ${componentName}: ${componentPath}`)
    successCount++
  } else {
    console.log(`❌ ${componentName}: ${componentPath} - 未找到`)
    console.log(`   查找路径: ${fullPath}`)
    console.log(`   替代路径: ${altPath}`)
    missingCount++
  }
}

console.log(`\n📊 验证结果:`)
console.log(`✅ 成功: ${successCount}`)
console.log(`❌ 失败: ${missingCount}`)

if (missingCount === 0) {
  console.log('\n🎉 所有组件验证通过！')
} else {
  console.log('\n⚠️ 有组件缺失，请检查构建过程')
  
  // 检查miniprogram_npm目录是否存在
  if (!fs.existsSync(MINIPROGRAM_NPM_DIR)) {
    console.log('\n💡 miniprogram_npm目录不存在，请运行构建脚本')
    console.log('   命令: node build_npm_simple.js')
  }
  
  // 检查tdesign-miniprogram目录
  const tdesignDir = path.join(MINIPROGRAM_NPM_DIR, 'tdesign-miniprogram')
  if (!fs.existsSync(tdesignDir)) {
    console.log('\n💡 tdesign-miniprogram目录不存在，请检查npm安装')
    console.log('   命令: npm install tdesign-miniprogram')
  }
}

// 输出正确的app.json配置
console.log('\n📝 正确的app.json配置:')
console.log('```json')
console.log('"usingComponents": {')
for (const [componentName, componentPath] of Object.entries(requiredComponents)) {
  console.log(`  "${componentName}": "tdesign-miniprogram/miniprogram_dist/${componentPath}",`)
}
console.log('}')
console.log('```')