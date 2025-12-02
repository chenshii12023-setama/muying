const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建NPM包...');

// 项目根目录
const projectRoot = __dirname;
const miniprogramRoot = projectRoot;
const miniprogramNpmDir = path.join(miniprogramRoot, 'miniprogram_npm');

console.log('📁 项目根目录:', projectRoot);
console.log('📦 miniprogram_npm目录:', miniprogramNpmDir);

// 检查package.json是否存在
const packageJsonPath = path.join(projectRoot, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json不存在');
    process.exit(1);
}

// 读取package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
console.log('📋 依赖包:', Object.keys(packageJson.dependencies || {}));

// 创建miniprogram_npm目录
if (!fs.existsSync(miniprogramNpmDir)) {
    fs.mkdirSync(miniprogramNpmDir, { recursive: true });
    console.log('✅ 创建miniprogram_npm目录');
}

// 处理每个依赖包
const dependencies = packageJson.dependencies || {};
let processedCount = 0;

Object.keys(dependencies).forEach(packageName => {
    const packagePath = path.join(projectRoot, 'node_modules', packageName);
    const targetPath = path.join(miniprogramNpmDir, packageName);
    
    if (fs.existsSync(packagePath)) {
        // 复制整个包到miniprogram_npm
        copyFolder(packagePath, targetPath);
        console.log(`✅ 复制 ${packageName} 到 miniprogram_npm`);
        processedCount++;
    } else {
        console.log(`❌ 找不到包 ${packageName} 在 node_modules`);
    }
});

// 复制文件夹函数
function copyFolder(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        
        if (fs.statSync(srcPath).isDirectory()) {
            copyFolder(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

// 验证TDesign组件路径
const tdesignPath = path.join(miniprogramNpmDir, 'tdesign-miniprogram', 'miniprogram_dist');
if (fs.existsSync(tdesignPath)) {
    console.log('✅ TDesign组件构建成功');
    
    // 检查button组件是否存在
    const buttonPath = path.join(tdesignPath, 'button', 'button.js');
    if (fs.existsSync(buttonPath)) {
        console.log('✅ button组件可用');
    } else {
        console.log('❌ button组件缺失');
    }
} else {
    console.log('❌ TDesign组件构建失败');
}

console.log(`🎉 构建完成! 处理了 ${processedCount} 个包`);
console.log('📱 请在微信开发者工具中点击"工具" -> "构建NPM"');