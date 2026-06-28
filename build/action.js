// build/action.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径 (ESM 中 __dirname 不可用)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('❌ 错误: 请提供版本号，例如: node ./build/action.js v0.0.16');
    process.exit(1);
}

const versionInput = args[0];

// 验证版本号格式
if (!versionInput.startsWith('v')) {
    console.error('❌ 错误: 版本号必须以 "v" 开头，例如: v0.0.16');
    process.exit(1);
}

// 提取纯数字版本号 (去掉 'v')
const cleanVersion = versionInput.substring(1);

// 定义 package.json 路径
const packageJsonPath = path.resolve(__dirname, '../package.json');

try {
    // 1. 读取 package.json
    console.log(`📦 正在读取 package.json...`);
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    // 2. 更新 version 字段
    console.log(`🔄 更新版本: ${packageJson.version} -> ${cleanVersion}`);
    packageJson.version = cleanVersion;

    // 3. 写回 package.json (保持格式化，2空格缩进)
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    console.log('✅ package.json 已更新');

    // 4. Git 操作
    console.log('🚀 开始 Git 操作...');

    // git add package.json
    execSync('git add package.json', { stdio: 'inherit' });

    // git commit
    const commitMessage = `docs: version is ${versionInput}`;
    console.log(`📝 创建提交: "${commitMessage}"`);
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

    // git push
    console.log('📤 推送到远端仓库...');
    execSync('git push', { stdio: 'inherit' });

    // 5. 打 Tag
    console.log(`🏷️  创建标签: ${versionInput}`);
    execSync(`git tag ${versionInput}`, { stdio: 'inherit' });

    // 6. 推送 Tag
    console.log('📤 推送标签到远端...');
    execSync(`git push origin ${versionInput}`, { stdio: 'inherit' });

    console.log('🎉 所有操作成功完成！');

} catch (error) {
    console.error('❌ 执行出错:', error.message);
    process.exit(1);
}