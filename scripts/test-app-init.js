#!/usr/bin/env node

const { chromium } = require('@playwright/test');
const { spawn, execSync } = require('child_process');
const { once } = require('events');
const http = require('http');

const MAX_TIMEOUT = 10000; // 10 seconds maximum wait time
const NETWORK_IDLE_TIMEOUT = 5000; // 5 seconds for network idle
const INIT_CHECK_INTERVAL = 100; // Check every 100ms
const POST_INIT_DELAY = 500; // Wait 500ms after initialization
const SERVER_PORT = 3000;
const MAX_RETRIES = 5; // Maximum number of retries per test run

let lastLogTime = Date.now();
let initializationStartTime = null;
let httpServer = null;
let isShuttingDown = false;
let isCleaningUp = false;

// Function to check if server is responding
async function isServerReady() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${SERVER_PORT}`, (res) => {
      res.destroy();
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Function to start the HTTP server and return a promise that resolves when it's ready
async function startServer() {
  console.log('Starting HTTP server...');
  
  // Start the server process with the docs directory
  httpServer = spawn('npx', ['http-server', 'docs', '-p', SERVER_PORT.toString()], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // Handle server output
  httpServer.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line) console.log('[Server stdout]', line);
    }
  });

  httpServer.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line) console.log('[Server stderr]', line);
    }
  });

  // Handle server exit
  httpServer.on('exit', (code, signal) => {
    if (code !== null) {
      console.log(`[Server] Process exited with code ${code}`);
    } else {
      console.log(`[Server] Process killed with signal ${signal}`);
    }
  });

  // Wait for server to be ready
  let attempts = 0;
  const maxAttempts = 30; // Increased attempts with longer interval
  while (attempts < maxAttempts) {
    if (await isServerReady()) {
      console.log('✅ Server is ready');
      // Add a small delay to ensure the server is fully initialized
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }
    attempts++;
    if (attempts === maxAttempts) {
      throw new Error('Server failed to start');
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Increased interval
  }
}

// Function to stop the HTTP server
async function stopServer() {
  if (httpServer && !isShuttingDown) {
    isShuttingDown = true;
    console.log('Stopping HTTP server...');
    
    // Send SIGTERM to the server process
    httpServer.kill('SIGTERM');
    
    try {
      // Wait for the process to exit
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Server shutdown timed out'));
        }, 5000);

        httpServer.once('exit', (code, signal) => {
          clearTimeout(timeout);
          resolve();
        });
      });
      
      console.log('✅ Server stopped successfully');
    } catch (error) {
      console.error('Failed to stop server gracefully:', error);
      // Force kill if graceful shutdown fails
      httpServer.kill('SIGKILL');
    }
    
    httpServer = null;
    isShuttingDown = false;
  }
}

// Function to wait for network idle
async function waitForNetworkIdle(page) {
  try {
    await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT });
  } catch (error) {
    console.log('Warning: Network idle check timed out, continuing...');
  }
}

// Function to verify game state
async function verifyGameState(page) {
  try {
    // Check if game state is properly initialized
    const gameState = await page.evaluate(() => {
      if (!window.gameState) return false;
      return {
        board: window.gameState.board,
        nextOrb: window.gameState.nextOrb,
        score: window.gameState.score,
        moves: window.gameState.moves,
        maxChain: window.gameState.maxChain,
        isPractice: window.gameState.isPractice,
        isGameOver: window.gameState.isGameOver,
        crystals: window.gameState.crystals,
        highestOrbs: Array.from(window.gameState.highestOrbs)
      };
    });

    if (!gameState) {
      throw new Error('Game state not initialized');
    }

    // Verify board dimensions
    if (!Array.isArray(gameState.board) || 
        gameState.board.length !== 6 || 
        !gameState.board.every(row => Array.isArray(row) && row.length === 5)) {
      throw new Error('Invalid board dimensions');
    }

    // Verify initial state
    if (gameState.score !== 0 || gameState.moves !== 0 || gameState.maxChain !== 0) {
      throw new Error('Invalid initial game state');
    }

    // Verify next orb
    if (typeof gameState.nextOrb !== 'number' || gameState.nextOrb < 1 || gameState.nextOrb > 6) {
      throw new Error('Invalid next orb value');
    }

    console.log('✅ Game state verified');
    return true;
  } catch (error) {
    console.error('❌ Game state verification failed:', error.message);
    return false;
  }
}

// Main test function
async function runTest() {
  let browser = null;
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      // Start the server
      await startServer();

      // Launch browser
      console.log('Launching browser...');
      browser = await chromium.launch();

      // Create new page
      const context = await browser.newContext();
      const page = await context.newPage();

      // Add console log listener
      page.on('console', msg => {
        const text = msg.text();
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [Browser ${msg.type()}] ${text}`);
        lastLogTime = Date.now();
      });

      // Navigate to app
      console.log('Navigating to app...');
      await page.goto(`http://localhost:${SERVER_PORT}`);

      // Wait for network to be idle
      console.log('Waiting for network to be idle...');
      await waitForNetworkIdle(page);
      console.log('Network is idle, checking initialization...');

      // Start initialization timer
      console.log('Waiting for asset loading...');
      initializationStartTime = Date.now();

      // Wait for assets to load
      while (Date.now() - initializationStartTime < MAX_TIMEOUT) {
        const assetsLoaded = await page.evaluate(() => window.assetsLoaded);
        if (assetsLoaded) {
          console.log('✅ Assets loaded successfully');
          await new Promise(resolve => setTimeout(resolve, POST_INIT_DELAY));
          
          // Verify game state
          if (await verifyGameState(page)) {
            console.log('✅ Test completed successfully');
            return true;
          }
          break; // Break to retry if game state verification fails
        }
        await new Promise(resolve => setTimeout(resolve, INIT_CHECK_INTERVAL));
      }

      throw new Error('Asset loading or game state verification failed');

    } catch (error) {
      console.error(`❌ Test failed (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
      retryCount++;
      
      if (retryCount === MAX_RETRIES) {
        throw new Error(`Test failed after ${MAX_RETRIES} attempts`);
      }
      
      // Cleanup before retry
      if (browser) {
        await browser.close();
        browser = null;
      }
      await stopServer();
      
      // Wait before retrying
      console.log(`Retrying in 2 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      // Cleanup
      if (browser) {
        await browser.close();
      }
      await stopServer();
    }
  }
  
  return false;
}

// Handle process termination
async function cleanup() {
  if (isCleaningUp) {
    return;
  }
  isCleaningUp = true;
  console.log('Cleaning up...');
  
  try {
    await stopServer();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Received SIGINT, cleaning up...');
  cleanup();
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, cleaning up...');
  cleanup();
});

// Run the test
(async () => {
  try {
    const success = await runTest();
    if (!success) {
      process.exit(1);
    }
    await cleanup();
  } catch (error) {
    console.error('Test failed:', error);
    await cleanup();
  }
})();

