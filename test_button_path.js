const fs = require('fs');

console.log('🧪 测试 TDesign 组件路径\n');

const tests = [
  {
    name: 'button/button.js',
    path: 'D:/baby/muying/miniprogram_npm/tdesign-miniprogram/miniprogram_dist/button/button.js'
  },
  {
    name: 'loading/loading.js', 
    path: 'D:/baby/muying/miniprogram_npm/tdesign-miniprogram/miniprogram_dist/loading/loading.js'
  }
];

tests.forEach(test => {
  const exists = fs.existsSync(test.path);
  console.log(`${exists ? '✅' : '❌'} ${test.name}: ${exists ? '存在' : '不存在'}`);
});

console.log('\n📝 当前配置:');
console.log('"t-button": "../../miniprogram_npm/tdesign-miniprogram/miniprogram_dist/button/button"');
console.log('"t-loading": "../../miniprogram_npm/tdesign-miniprogram/miniprogram_dist/loading/loading"');

console.log('\n🔧 如果还有问题，可能的原因:');
console.log('1. 小程序期望的入口文件是 index.js 而不是 button.js');
console.log('2. 组件内部的引用路径有问题');
console.log('3. 小程序版本兼容性问题');

console.log('\n💡 备用方案:');
console.log('完全移除 TDesign 组件，全部使用原生实现');
console.log('这样可以确保完全兼容性');

console.log('\n🏁 测试完成');