const fs = require('fs');
const path = require('path');

// 1. 指向 JSON 文件（在 assets/earth-explore 目录下）
const jsonPath = path.resolve(__dirname, '../assets/earth-explore/web-files.json');

// 2. 静态资源的 require 基础路径（相对于最终生成的 JS 文件）
const basePath = '../assets/earth-explore';

// 3. 输出文件路径（生成到 scripts 目录下）
const outputFile = path.resolve(__dirname, 'webAssets.js');

// 读取 JSON 列表
const files = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// 拼接 require 路径
const requires = files.map(file => `require('${basePath}/${file}')`);

const output = `// Auto-generated from web-files.json\n` +
               `module.exports = [\n  ${requires.join(',\n  ')}\n];\n`;

fs.writeFileSync(outputFile, output);
console.log(`✅ Generated ${outputFile} with ${files.length} assets.`);