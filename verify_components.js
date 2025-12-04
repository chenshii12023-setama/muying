const fs = require('fs');
const path = require('path');

console.log('🔍 验证项目组件配置...');

// 验证app.json中的组件路径
const appJsonPath = path.join(__dirname, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

console.log('📋 验证app.json中的组件配置:');
const components = appJson.usingComponents || {};

let allValid = true;
Object.entries(components).forEach(([compName, compPath]) => {
        const fullPath = path.join(__dirname, 'miniprogram_npm', compPath);
    const jsPath = fullPath.replace(/\/[^\/]*$/, '/button.js'); // 检查.js文件
    const exists = fs.existsSync(fullPath);
    console.log(`${exists ? '✅' : '❌'} ${compName}: ${compPath}`);
    
    if (!exists) {
        allValid = false;
        // 尝试查找正确的路径
        const altPath = compPath.replace('tdesign-miniprogram/', 'tdesign-miniprogram/miniprogram_dist/');
        const altFullPath = path.join(__dirname, 'miniprogram_npm', altPath);
        if (fs.existsSync(altFullPath)) {
            console.log(`💡 正确路径应该是: ${altPath}`);
        }
    }
});

if (allValid) {
    console.log('🎉 所有组件配置正确!');
} else {
    console.log('❌ 部分组件配置错误');
}

// 验证关键页面文件
console.log('\n📄 验证页面文件:');
appJson.pages.forEach(pagePath => {
    const wxmlPath = path.join(__dirname, `${pagePath}.wxml`);
    const jsPath = path.join(__dirname, `${pagePath}.js`);
    const jsonPath = path.join(__dirname, `${pagePath}.json`);
    
    console.log(`📄 ${pagePath}:`);
    console.log(`  ${fs.existsSync(wxmlPath) ? '✅' : '❌'} wxml`);
    console.log(`  ${fs.existsSync(jsPath) ? '✅' : '❌'} js`);
    console.log(`  ${fs.existsSync(jsonPath) ? '✅' : '❌'} json`);
});

console.log('\n✅ 验证完成!');