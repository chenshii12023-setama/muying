#!/usr/bin/env node

/**
 * 微信小程序NPM包构建脚本
 * 自动复制必要的NPM包到miniprogram_npm目录
 */

const fs = require('fs')
const path = require('path')

const PROJECT_ROOT = __dirname
const MINIPROGRAM_NPM_DIR = path.join(PROJECT_ROOT, 'miniprogram_npm')
const NODE_MODULES_DIR = path.join(PROJECT_ROOT, 'node_modules')

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ 创建目录: ${dir}`)
  }
}

/**
 * 递归复制目录
 */
function copyDir(src, dest, includeFilter = null) {
  if (!fs.existsSync(src)) {
    console.log(`❌ 源目录不存在: ${src}`)
    return false
  }

  ensureDir(dest)
  
  let copiedCount = 0
  const entries = fs.readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    
    if (entry.isDirectory()) {
      const childCount = copyDir(srcPath, destPath, includeFilter)
      copiedCount += childCount
    } else {
      // 应用文件过滤器
      if (includeFilter && !includeFilter(entry.name)) {
        continue
      }
      
      try {
        fs.copyFileSync(srcPath, destPath)
        copiedCount++
        if (copiedCount <= 5) {
          console.log(`📄 复制文件: ${entry.name}`)
        }
      } catch (error) {
        console.log(`❌ 复制失败: ${entry.name} - ${error.message}`)
      }
    }
  }
  
  return copiedCount
}

/**
 * 文件过滤器 - 只复制小程序需要的文件
 */
function wechatFileFilter(filename) {
  const allowedExts = ['.js', '.json', '.wxss', '.wxml', '.ts']
  const allowedFiles = ['package.json', 'README.md', 'LICENSE']
  
  // 检查扩展名
  for (const ext of allowedExts) {
    if (filename.endsWith(ext)) {
      return true
    }
  }
  
  // 检查特定文件名
  return allowedFiles.includes(filename)
}

/**
 * 构建TDesign组件包
 */
function buildTDesign() {
  console.log('\n🚀 构建TDesign组件包...')
  
  const sourceDir = path.join(NODE_MODULES_DIR, 'tdesign-miniprogram')
  const targetDir = path.join(MINIPROGRAM_NPM_DIR, 'tdesign-miniprogram')
  
  if (!fs.existsSync(sourceDir)) {
    console.log('❌ tdesign-miniprogram 未安装，请先运行: npm install tdesign-miniprogram')
    return false
  }
  
  // 复制miniprogram_dist目录（主要组件文件）
  const distSource = path.join(sourceDir, 'miniprogram_dist')
  const distTarget = path.join(targetDir, 'miniprogram_dist')
  const distCount = copyDir(distSource, distTarget, wechatFileFilter)
  
  // 复制package.json
  const packageSource = path.join(sourceDir, 'package.json')
  const packageTarget = path.join(targetDir, 'package.json')
  if (fs.existsSync(packageSource)) {
    fs.copyFileSync(packageSource, packageTarget)
    console.log(`📄 复制文件: package.json`)
  }
  
  console.log(`✅ TDesign构建完成，共复制 ${distCount + 1} 个文件`)
  return true
}

/**
 * 验证关键组件
 */
function validateTDesign() {
  console.log('\n🔍 验证TDesign组件...')
  
  const requiredComponents = [
    'button',
    'cell',
    'cell-group',
    'input',
    'dialog',
    'message',
    'loading',
    'icon'
  ]
  
  const componentsDir = path.join(MINIPROGRAM_NPM_DIR, 'tdesign-miniprogram', 'miniprogram_dist')
  let missingCount = 0
  
  for (const component of requiredComponents) {
    const componentPath = path.join(componentsDir, component)
    const indexPath = path.join(componentPath, 'index.js')
    
    if (!fs.existsSync(indexPath)) {
      console.log(`❌ 缺少组件: ${component}`)
      missingCount++
    } else {
      console.log(`✅ 组件存在: ${component}`)
    }
  }
  
  if (missingCount === 0) {
    console.log('🎉 所有必要组件验证通过！')
  } else {
    console.log(`⚠️  有 ${missingCount} 个组件缺失`)
  }
  
  return missingCount === 0
}

/**
 * 创建项目包信息
 */
function createProjectPackage() {
  const packageJson = {
    "name": "miniprogram_npm_packages",
    "version": "1.0.0",
    "description": "微信小程序NPM包构建目录 - 宝妈育儿轻指南",
    "packages": ["tdesign-miniprogram"],
    "buildTime": new Date().toISOString()
  }
  
  const packagePath = path.join(MINIPROGRAM_NPM_DIR, 'package.json')
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
  console.log('📄 创建项目包信息')
}

/**
 * 主构建流程
 */
function main() {
  console.log('🔧 微信小程序NPM包构建工具')
  console.log('=====================================')
  
  // 清理旧的构建目录
  if (fs.existsSync(MINIPROGRAM_NPM_DIR)) {
    try {
      fs.rmSync(MINIPROGRAM_NPM_DIR, { recursive: true, force: true })
      console.log('🧹 清理旧的构建目录')
    } catch (error) {
      console.log('⚠️  清理失败:', error.message)
    }
  }
  
  // 创建构建目录
  ensureDir(MINIPROGRAM_NPM_DIR)
  
  // 构建组件包
  const tdesignSuccess = buildTDesign()
  
  if (tdesignSuccess) {
    // 验证组件
    const isValid = validateTDesign()
    
    if (isValid) {
      // 创建项目信息
      createProjectPackage()
      
      console.log('\n🎉 NPM包构建完成！')
      console.log('📦 构建目录:', MINIPROGRAM_NPM_DIR)
      console.log('💡 请重新打开微信开发者工具或点击工具栏的"构建NPM"按钮')
    } else {
      console.log('\n❌ 构建验证失败')
      process.exit(1)
    }
  } else {
    console.log('\n❌ 构建失败')
    process.exit(1)
  }
}

// 运行主程序
if (require.main === module) {
  main()
}

module.exports = { main, buildTDesign, validateTDesign }