const fs = require('fs');
const path = require('path');

console.log('开始构建微信小程序npm包...');

// 确保miniprogram_npm目录存在
const npmDir = path.join(__dirname, 'miniprogram_npm');
if (!fs.existsSync(npmDir)) {
    fs.mkdirSync(npmDir, { recursive: true });
    console.log('已创建miniprogram_npm目录');
}

// 读取package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('当前npm依赖:', packageJson.dependencies);
} else {
    console.error('package.json文件不存在');
    process.exit(1);
}

// 手动复制tdesign-miniprogram到miniprogram_npm
const sourceDir = path.join(__dirname, 'node_modules/tdesign-miniprogram');
const targetDir = path.join(__dirname, 'miniprogram_npm/tdesign-miniprogram');

if (fs.existsSync(sourceDir)) {
    // 删除目标目录（如果存在）
    if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
    }
    
    // 复制文件
    copyDirectory(sourceDir, targetDir);
    console.log('✅ tdesign-miniprogram构建成功');
} else {
    console.log('❌ tdesign-miniprogram包不存在，请先运行npm install');
}

function copyDirectory(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('npm包构建完成！');
console.log('请在微信开发者工具中点击"构建npm"或在工具->构建npm菜单中选择构建');