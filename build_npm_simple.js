/**
 * 简化的NPM构建脚本
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔧 构建微信小程序NPM包...')

try {
  // 1. 安装依赖
  console.log('📦 安装依赖...')
  execSync('npm install tdesign-miniprogram@1.9.5 --save', { stdio: 'inherit', cwd: __dirname })
  
  // 2. 运行完整构建
  console.log('🏗️ 构建NPM包...')
  execSync('node final_build_npm.js', { stdio: 'inherit', cwd: __dirname })
  
  console.log('\n🎉 构建完成！现在可以重新打开微信开发者工具或点击"构建NPM"按钮')
  
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}