const fs = require('fs');
const path = require('path');

console.log('🔍 验证所有页面的TDesign组件配置...');

// 获取所有页面的JSON文件
const pagesDir = path.join(__dirname, 'pages');
const pageDirs = fs.readdirSync(pagesDir).filter(item => {
  const itemPath = path.join(pagesDir, item);
  return fs.statSync(itemPath).isDirectory();
});

let allValid = true;
const errors = [];

pageDirs.forEach(pageDir => {
  const jsonPath = path.join(pagesDir, pageDir, `${pageDir}.json`);
  
  if (fs.existsSync(jsonPath)) {
    const pageJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const components = pageJson.usingComponents || {};
    
    console.log(`\n📄 验证页面: ${pageDir}`);
    
    Object.entries(components).forEach(([compName, compPath]) => {
      // 只检查TDesign组件
      if (compPath.includes('tdesign-miniprogram')) {
        // 标准化路径
        const standardPath = compPath.includes('miniprogram_dist') ? 
          compPath : 
          compPath.replace('tdesign-miniprogram/', 'tdesign-miniprogram/miniprogram_dist/');
        
        // 检查组件JSON文件是否存在
        const componentJsonPath = path.join(__dirname, 'miniprogram_npm', standardPath + '.json');
        const exists = fs.existsSync(componentJsonPath);
        
        console.log(`  ${exists ? '✅' : '❌'} ${compName}: ${standardPath}`);
        
        if (!exists) {
          allValid = false;
          errors.push({
            page: pageDir,
            component: compName,
            path: standardPath,
            fullPath: componentJsonPath
          });
        }
      }
    });
  }
});

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('🎉 所有TDesign组件路径都正确！');
} else {
  console.log('❌ 发现以下组件路径错误:');
  errors.forEach(error => {
    console.log(`  📄 ${error.page}: ${error.component} -> ${error.path}`);
    console.log(`     完整路径: ${error.fullPath}`);
  });
  
  console.log('\n💡 修复建议:');
  console.log('1. 确保所有组件路径都包含 miniprogram_dist');
  console.log('2. 组件格式为: tdesign-miniprogram/miniprogram_dist/component/component');
  console.log('3. 使用 npm run build 重新构建miniprogram_npm');
}

console.log('\n✅ 验证完成！');