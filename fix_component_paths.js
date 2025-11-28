const fs = require('fs')
const path = require('path')

/**
 * 批量修复所有JSON文件中的TDesign组件路径
 */

const PAGES_DIR = path.join(__dirname, 'pages')
const APP_JSON_PATH = path.join(__dirname, 'app.json')

// 路径映射
const pathMapping = {
  'tdesign-miniprogram/button/button': 'tdesign-miniprogram/miniprogram_dist/button/button',
  'tdesign-miniprogram/cell/cell': 'tdesign-miniprogram/miniprogram_dist/cell/cell',
  'tdesign-miniprogram/cell-group/cell-group': 'tdesign-miniprogram/miniprogram_dist/cell-group/cell-group',
  'tdesign-miniprogram/grid/grid': 'tdesign-miniprogram/miniprogram_dist/grid/grid',
  'tdesign-miniprogram/grid-item/grid-item': 'tdesign-miniprogram/miniprogram_dist/grid-item/grid-item',
  'tdesign-miniprogram/input/input': 'tdesign-miniprogram/miniprogram_dist/input/input',
  'tdesign-miniprogram/tabs/tabs': 'tdesign-miniprogram/miniprogram_dist/tabs/tabs',
  'tdesign-miniprogram/tab-panel/tab-panel': 'tdesign-miniprogram/miniprogram_dist/tab-panel/tab-panel',
  'tdesign-miniprogram/upload/upload': 'tdesign-miniprogram/miniprogram_dist/upload/upload',
  'tdesign-miniprogram/dialog/dialog': 'tdesign-miniprogram/miniprogram_dist/dialog/dialog',
  'tdesign-miniprogram/message/message': 'tdesign-miniprogram/miniprogram_dist/message/message',
  'tdesign-miniprogram/loading/loading': 'tdesign-miniprogram/miniprogram_dist/loading/loading',
  'tdesign-miniprogram/icon/icon': 'tdesign-miniprogram/miniprogram_dist/icon/icon',
  'tdesign-miniprogram/divider/divider': 'tdesign-miniprogram/miniprogram_dist/divider/divider',
  'tdesign-miniprogram/radio/radio': 'tdesign-miniprogram/miniprogram_dist/radio/radio',
  'tdesign-miniprogram/radio-group/radio-group': 'tdesign-miniprogram/miniprogram_dist/radio-group/radio-group',
  'tdesign-miniprogram/slider/slider': 'tdesign-miniprogram/miniprogram_dist/slider/slider',
  'tdesign-miniprogram/rate/rate': 'tdesign-miniprogram/miniprogram_dist/rate/rate',
  'tdesign-miniprogram/tag/tag': 'tdesign-miniprogram/miniprogram_dist/tag/tag'
}

function fixJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let modified = false
    let newContent = content
    
    for (const [oldPath, newPath] of Object.entries(pathMapping)) {
      const regex = new RegExp(`"${oldPath}"`, 'g')
      if (regex.test(newContent)) {
        newContent = newContent.replace(regex, `"${newPath}"`)
        modified = true
        console.log(`🔧 修复 ${filePath}: ${oldPath} -> ${newPath}`)
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8')
      return true
    }
  } catch (error) {
    console.log(`❌ 处理文件失败: ${filePath} - ${error.message}`)
  }
  
  return false
}

function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      findJsonFiles(filePath, fileList)
    } else if (file.endsWith('.json')) {
      fileList.push(filePath)
    }
  }
  
  return fileList
}

console.log('🔧 开始修复TDesign组件路径...\n')

let fixedCount = 0

// 修复app.json
if (fixJsonFile(APP_JSON_PATH)) {
  fixedCount++
}

// 查找并修复所有页面JSON文件
const jsonFiles = findJsonFiles(PAGES_DIR)

for (const jsonFile of jsonFiles) {
  if (fixJsonFile(jsonFile)) {
    fixedCount++
  }
}

console.log(`\n✅ 修复完成！共修复了 ${fixedCount} 个文件`)
console.log('💡 请重新打开微信开发者工具或点击"构建NPM"按钮')