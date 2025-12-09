// 测试 TDesign 组件的各种可能路径
const fs = require('fs');
const path = require('path');

console.log('🧪 测试 TDesign 组件路径\n');

const basePath = 'D:/baby/muying';
const possiblePaths = [
  'miniprogram_npm/tdesign-miniprogram/button/button',
  'miniprogram_npm/tdesign-miniprogram/miniprogram_dist/button/button',
  'miniprogram_npm/tdesign-miniprogram/button',
  'miniprogram_npm/tdesign-miniprogram/miniprogram_dist/button'
];

possiblePaths.forEach(testPath => {
  const fullPath = path.join(basePath, testPath + '.js');
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${testPath}`);
  
  if (exists) {
    console.log(`   📁 完整路径: ${fullPath}`);
  }
});

console.log('\n🔧 常见的 TDesign 引用方式:');
console.log('1. "t-button": "tdesign-miniprogram/button/button"');
console.log('2. "t-button": "tdesign-miniprogram/miniprogram_dist/button"');
console.log('3. "t-button": "miniprogram_npm/tdesign-miniprogram/button"');
console.log('4. "t-button": "../../miniprogram_npm/tdesign-miniprogram/button"');

console.log('\n💡 如果使用 NPM 构建后的路径:');
console.log('通常格式是 "tdesign-miniprogram/button/button"');
console.log('前提是已经在开发者工具中执行了"构建 npm"');

console.log('\n🔍 检查是否需要构建 npm:');
const npmPath = path.join(basePath, 'miniprogram_npm');
const hasBuilt = fs.existsSync(npmPath);
console.log(`miniprogram_npm 目录存在: ${hasBuilt ? '✅ 是' : '❌ 否'}`);

if (!hasBuilt) {
  console.log('📝 请在微信开发者工具中: 工具 → 构建 npm');
}

console.log('\n🏁 测试完成');