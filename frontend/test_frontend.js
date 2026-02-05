const fs = require('fs');
const path = require('path');

console.log('🔍 Checking frontend directory structure...\n');

const frontendDir = __dirname;
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/app/api/auth/route.ts',
  'src/app/api/tasks/route.ts'
];

console.log('📋 Required files check:');
requiredFiles.forEach(file => {
  const fullPath = path.join(frontendDir, file);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n📄 package.json contents:');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(frontendDir, 'package.json'), 'utf8'));
  console.log(`  Name: ${pkg.name || 'N/A'}`);
  console.log(`  Version: ${pkg.version || 'N/A'}`);
  console.log(`  Scripts: ${Object.keys(pkg.scripts || {}).join(', ') || 'None'}`);
  console.log(`  Dependencies: ${Object.keys(pkg.dependencies || {}).length} found`);
} catch (e) {
  console.log('  ❌ Could not read package.json');
}

console.log('\n📁 Directory structure:');
function walkDir(dir, depth = 0) {
  if (depth > 3) return; // Limit depth

  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    const indent = '  '.repeat(depth);

    if (stat.isDirectory()) {
      console.log(`${indent}📁 ${item}/`);
      walkDir(itemPath, depth + 1);
    } else {
      console.log(`${indent}📄 ${item}`);
    }
  });
}
walkDir(frontendDir);

console.log('\n💡 To run the frontend:');
console.log('  1. Make sure Node.js and npm are installed');
console.log('  2. Run: npm install');
console.log('  3. Run: npm run dev');
console.log('  4. Visit: http://localhost:3000');