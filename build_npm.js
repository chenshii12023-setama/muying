const fs = require('fs')
const path = require('path')

// 创建 miniprogram_npm 目录
const miniprogramNpmDir = path.join(__dirname, 'miniprogram_npm')

if (!fs.existsSync(miniprogramNpmDir)) {
  fs.mkdirSync(miniprogramNpmDir, { recursive: true })
  console.log('已创建 miniprogram_npm 目录')
}

// 复制 tdesign-miniprogram 到 miniprogram_npm
const sourceDir = path.join(__dirname, 'node_modules', 'tdesign-miniprogram')
const targetDir = path.join(miniprogramNpmDir, 'tdesign-miniprogram')

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      // 只复制必要的文件
      if (entry.name.endsWith('.js') || entry.name.endsWith('.json') || entry.name.endsWith('.wxss') || entry.name.endsWith('.wxml')) {
        fs.copyFileSync(srcPath, destPath)
      }
    }
  }
}

if (fs.existsSync(sourceDir)) {
  copyDir(sourceDir, targetDir)
  console.log('已复制 tdesign-miniprogram 到 miniprogram_npm')
} else {
  console.log('未找到 tdesign-miniprogram 包，请先运行 npm install')
}

// 创建 package.json 在 miniprogram_npm 中
const packageJson = {
  "name": "miniprogram_npm_packages",
  "version": "1.0.0",
  "description": "微信小程序NPM包构建目录"
}

fs.writeFileSync(
  path.join(miniprogramNpmDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
)

console.log('NPM包构建完成！')
console.log('请重新打开微信开发者工具或点击工具栏的"构建NPM"按钮。')