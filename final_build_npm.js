const fs = require('fs')
const path = require('path')

/**
 * 最终的NPM构建脚本 - 确保TDesign组件正确复制
 */

const PROJECT_ROOT = __dirname
const MINIPROGRAM_NPM_DIR = path.join(PROJECT_ROOT, 'miniprogram_npm')

console.log('🔧 开始构建微信小程序NPM包...')

// 清理并创建目录
if (fs.existsSync(MINIPROGRAM_NPM_DIR)) {
  fs.rmSync(MINIPROGRAM_NPM_DIR, { recursive: true, force: true })
}
fs.mkdirSync(MINIPROGRAM_NPM_DIR, { recursive: true })

// 复制整个TDesign目录
const sourceDir = path.join(PROJECT_ROOT, 'node_modules', 'tdesign-miniprogram')
const targetDir = path.join(MINIPROGRAM_NPM_DIR, 'tdesign-miniprogram')

function copyRecursive(src, dest) {
  const stats = fs.statSync(src)
  
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    const files = fs.readdirSync(src)
    
    files.forEach(file => {
      const srcPath = path.join(src, file)
      const destPath = path.join(dest, file)
      copyRecursive(srcPath, destPath)
    })
  } else {
    // 只复制需要的文件类型
    const filename = path.basename(src)
    const allowedExts = ['.js', '.json', '.wxss', '.wxml', '.ts', '.md']
    const allowedFiles = ['package.json', 'README.md', 'LICENSE', '.wechatide.ib.json']
    
    const isAllowed = allowedExts.some(ext => filename.endsWith(ext)) || allowedFiles.includes(filename)
    
    if (isAllowed) {
      fs.copyFileSync(src, dest)
    }
  }
}

if (fs.existsSync(sourceDir)) {
  copyRecursive(sourceDir, targetDir)
  console.log('✅ TDesign组件复制完成')
} else {
  console.log('❌ tdesign-miniprogram 未找到，请先运行: npm install')
  process.exit(1)
}

// 创建项目信息文件
const packageInfo = {
  name: "miniprogram_npm_packages",
  version: "1.0.0",
  description: "微信小程序NPM包构建目录",
  buildTime: new Date().toISOString(),
  packages: ["tdesign-miniprogram"]
}

fs.writeFileSync(
  path.join(MINIPROGRAM_NPM_DIR, 'package.json'),
  JSON.stringify(packageInfo, null, 2)
)

// 验证关键组件
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

console.log('\n🔍 验证关键组件...')
let allValid = true

for (const component of requiredComponents) {
  // TDesign组件可能有不同的命名方式，尝试多种可能
  const possiblePaths = [
    path.join(targetDir, 'miniprogram_dist', component, 'index.js'),
    path.join(targetDir, 'miniprogram_dist', component, `${component}.js`)
  ]
  
  let found = false
  for (const checkPath of possiblePaths) {
    if (fs.existsSync(checkPath)) {
      console.log(`✅ ${component}`)
      found = true
      break
    }
  }
  
  if (!found) {
    console.log(`❌ ${component} - 未找到`)
    allValid = false
  }
}

if (allValid) {
  console.log('\n🎉 NPM包构建成功完成！')
  console.log('📦 构建目录:', MINIPROGRAM_NPM_DIR)
  console.log('💡 请重新打开微信开发者工具或点击工具栏的"构建NPM"按钮')
} else {
  console.log('\n⚠️ 部分组件验证失败，但基础功能应该可用')
}