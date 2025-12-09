const fs = require('fs');
const path = require('path');

console.log('🧪 简单组件路径测试\n');

const testPaths = [
  'D:/baby/muying/pages/market/product-detail.json',
  'D:/baby/muying/miniprogram_npm/tdesign-miniprogram/miniprogram_dist/button/index.js',
  'D:/baby/muying/miniprogram_npm/tdesign-miniprogram/miniprogram_dist/tag/index.js',
  'D:/baby/muying/miniprogram_npm/tdesign-miniprogram/miniprogram_dist/rate/index.js',
  'D:/baby/muying/miniprogram_npm/tdesign-miniprogram/miniprogram_dist/avatar/index.js',
  'D:/baby/muying/miniprogram_npm/tdesign-miniprogram/miniprogram_dist/loading/index.js'
];

testPaths.forEach(testPath => {
  const exists = fs.existsSync(testPath);
  const relativePath = testPath.replace('D:/baby/muying/', '');
  console.log(`${exists ? '✅' : '❌'} ${relativePath}`);
});

console.log('\n📝 正确的组件配置应该是:');
console.log(`"t-button": "../../miniprogram_npm/tdesign-miniprogram/miniprogram_dist/button"`);
console.log(`"t-tag": "../../miniprogram_npm/tdesign-miniprogram/miniprogram_dist/tag"`);
console.log(`"t-rate": "../../miniprogram_npm/tdesign-miniprogram/miniprogram_dist/rate"`);
console.log(`"t-avatar": "../../miniprogram_npm/tdesign-miniprogram/miniprogram_dist/avatar"`);
console.log(`"t-loading": "../../miniprogram_npm/tdesign-miniprogram/miniprogram_dist/loading"`);

console.log('\n🏁 测试完成');