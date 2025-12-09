// 测试 TDesign 组件路径是否正确
const fs = require('fs');
const path = require('path');

console.log('🧪 检查 TDesign 组件路径...\n');

const basePath = 'D:/baby/muying';
const componentBase = path.join(basePath, 'miniprogram_npm/tdesign-miniprogram/miniprogram_dist');

const components = [
  'button/button',
  'tag/tag', 
  'rate/rate',
  'avatar/avatar',
  'loading/loading'
];

let allExist = true;

components.forEach(component => {
  const componentPath = path.join(componentBase, component, 'index.js');
  const exists = fs.existsSync(componentPath);
  
  console.log(`📁 ${component}: ${exists ? '✅ 存在' : '❌ 不存在'}`);
  if (!exists) {
    allExist = false;
    // 检查是否有 button.js 文件
    const altPath = path.join(componentBase, component, `${component.split('/')[0]}.js`);
    const altExists = fs.existsSync(altPath);
    if (altExists) {
      console.log(`   💡 找到替代文件: ${component.split('/')[0]}.js`);
    }
  }
});

console.log('\n' + '='.repeat(50));

// 检查相对路径是否正确
console.log('\n🔍 检查相对路径 (从 pages/market/product-detail.json):');
components.forEach(component => {
  const relativePath = `../../miniprogram_npm/tdesign-miniprogram/miniprogram_dist/${component}/index`;
  const fullPath = path.join(basePath, 'pages/market', relativePath + '.js');
  const exists = fs.existsSync(fullPath);
  console.log(`📂 ${relativePath}: ${exists ? '✅ 正确' : '❌ 错误'}`);
});

console.log('\n' + '='.repeat(50));
console.log('\n💡 修复建议:');

if (allExist) {
  console.log('✅ 所有组件路径都正确');
  console.log('📝 请尝试以下操作:');
  console.log('   1. 清除小程序缓存');
  console.log('   2. 重新构建 npm');
  console.log('   3. 重启开发者工具');
} else {
  console.log('❌ 部分组件路径有问题');
  console.log('📝 请检查组件文件是否存在');
}

console.log('\n🏁 检查完成');