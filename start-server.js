const { spawn } = require('child_process');
const path = require('path');
const ngrok = require('ngrok');
const net = require('net');

const PORT = 8080;
const serverPath = path.join(__dirname, 'node_modules', '.bin', 'http-server');

// Function to check if port is open
function waitForPort(port, host = '127.0.0.1', timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const socket = net.connect(port, host);
      socket.on('connect', () => {
        socket.end();
        resolve();
      });
      socket.on('error', () => {
        if (Date.now() - start > timeout) reject(new Error('Timeout waiting for port'));
        else setTimeout(check, 100);
      });
    };
    check();
  });
}

// Start HTTP server
console.log('Starting local HTTP server...');
const server = spawn(serverPath, ['-p', PORT], { shell: true, stdio: 'inherit' });

// Wait for server to be ready, then start ngrok
waitForPort(PORT).then(async () => {
  console.log(`Local server is ready on http://localhost:${PORT}`);
  try {
    const url = await ngrok.connect(PORT);
    console.log('✅ Your PWA is publicly accessible at:', url);
  } catch (err) {
    console.error('❌ Ngrok failed:', err);
  }
}).catch(err => console.error('❌ Failed to start server:', err));
