const fs = require('fs')
const path = require('path')

/**
 * 验证并修复NPM包问题
 */

const MINIPROGRAM_NPM_DIR = path.join(__dirname, 'miniprogram_npm')
const COMPONENTS_DIR = path.join(MINIPROGRAM_NPM_DIR, 'tdesign-miniprogram', 'miniprogram_dist')

console.log('🔍 验证NPM包状态...')

// 检查miniprogram_npm目录
if (!fs.existsSync(MINIPROGRAM_NPM_DIR)) {
  console.log('❌ miniprogram_npm目录不存在')
  console.log('💡 请运行: node build_npm_simple.js')
  process.exit(1)
}

console.log('✅ miniprogram_npm目录存在')

// 检查关键组件
const requiredComponents = [
  'button',
  'cell', 
  'cell-group',
  'input',
  'dialog',
  'message',
  'loading',
  'icon',
  'divider',
  'radio',
  'radio-group'
]

console.log('\n🔍 检查组件文件:')
let allGood = true

for (const component of requiredComponents) {
  const componentPath = path.join(COMPONENTS_DIR, component)
  const componentFile = path.join(componentPath, `${component}.js`)
  
  if (fs.existsSync(componentFile)) {
    console.log(`✅ ${component}`)
  } else {
    console.log(`❌ ${component} - ${componentFile}`)
    allGood = false
  }
}

if (!allGood) {
  console.log('\n🔧 尝试修复组件结构...')
  
  // 尝试从node_modules重新构建
  const sourceDir = path.join(__dirname, 'node_modules', 'tdesign-miniprogram', 'miniprogram_dist')
  
  for (const component of requiredComponents) {
    const sourceComponent = path.join(sourceDir, component)
    const targetComponent = path.join(COMPONENTS_DIR, component)
    
    if (fs.existsSync(sourceComponent) && !fs.existsSync(targetComponent)) {
      // 复制整个组件目录
      console.log(`📂 复制组件: ${component}`)
      copyRecursive(sourceComponent, targetComponent)
    }
  }
}

console.log('\n📋 验证后的app.json配置:')
console.log('"usingComponents": {')
for (const component of requiredComponents) {
  const componentName = `t-${component.replace('_', '-')}`
  console.log(`  "${componentName}": "tdesign-miniprogram/miniprogram_dist/${component}/${component}",`)
}
console.log('}')

console.log('\n🎉 验证完成！')
console.log('💡 如果问题仍然存在，请:')
console.log('   1. 重新打开微信开发者工具')
console.log('   2. 点击工具栏的"构建NPM"按钮')
console.log('   3. 清除缓存并重启')

function copyRecursive(src, dest) {
  const stats = fs.statSync(src)
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
    }
    
    const files = fs.readdirSync(src)
    files.forEach(file => {
      const srcPath = path.join(src, file)
      const destPath = path.join(dest, file)
      copyRecursive(srcPath, destPath)
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}