const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Next.js development server...');

// Spawn the next command from node_modules
const nextProcess = spawn('node', [
  path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next'),
  'dev'
], {
  stdio: 'inherit',
  cwd: __dirname
});

nextProcess.on('error', (err) => {
  console.error('Failed to start Next.js:', err.message);
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
});