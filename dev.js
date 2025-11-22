const { spawn } = require('child_process');
const path = require('path');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runScript(directory, command, name, color) {
  const cwd = path.join(__dirname, directory);
  console.log(`[${name}] Spawning ${npmCmd} run ${command} in ${cwd}`);
  
  const child = spawn(npmCmd, ['run', command], {
    cwd: cwd,
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  child.on('error', (err) => {
    console.error(`${color}[${name}] Failed to start process: ${err.message}\x1b[0m`);
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${color}[${name}] \x1b[0m${line}`);
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.error(`${color}[${name}] \x1b[0m${line}`);
      }
    });
  });

  child.on('close', (code) => {
    console.log(`[${name}] process exited with code ${code}`);
  });

  return child;
}

console.log('Starting frontend and backend...');

const frontend = runScript('frontend', 'dev', 'FRONTEND', '\x1b[36m'); // Cyan
const backend = runScript('backend', 'dev', 'BACKEND', '\x1b[32m');  // Green

process.on('SIGINT', () => {
  console.log('Stopping processes...');
  frontend.kill();
  backend.kill();
  process.exit();
});
