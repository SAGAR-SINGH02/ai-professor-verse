#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting AI Professor Verse Backend Development Server...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Please create one based on .env.example');
  console.log('📝 You can copy .env.example to .env and update the values\n');
}

// Services to start (in order)
const services = [
  {
    name: 'API Gateway',
    path: 'api-gateway',
    port: 3000,
    description: 'Main API entry point'
  }
];

// Function to start a service
function startService(service) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Starting ${service.name}...`);
    
    const servicePath = path.join(__dirname, service.path);
    
    // Check if service directory exists
    if (!fs.existsSync(servicePath)) {
      console.log(`❌ Service directory not found: ${servicePath}`);
      reject(new Error(`Service directory not found: ${servicePath}`));
      return;
    }
    
    // Check if package.json exists
    const packageJsonPath = path.join(servicePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`❌ package.json not found in: ${servicePath}`);
      reject(new Error(`package.json not found in: ${servicePath}`));
      return;
    }
    
    // Start the service
    const child = spawn('npm', ['run', 'dev'], {
      cwd: servicePath,
      stdio: 'pipe',
      shell: true
    });
    
    let started = false;
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${service.name}] ${output.trim()}`);
      
      // Check if service started successfully
      if (output.includes('listening on') || output.includes(`localhost:${service.port}`) || output.includes('Application is running')) {
        if (!started) {
          started = true;
          console.log(`✅ ${service.name} started successfully on port ${service.port}`);
          resolve(child);
        }
      }
    });
    
    child.stderr.on('data', (data) => {
      const error = data.toString();
      console.log(`[${service.name} ERROR] ${error.trim()}`);
    });
    
    child.on('error', (error) => {
      console.log(`❌ Failed to start ${service.name}: ${error.message}`);
      reject(error);
    });
    
    child.on('exit', (code) => {
      if (code !== 0 && !started) {
        console.log(`❌ ${service.name} exited with code ${code}`);
        reject(new Error(`Service exited with code ${code}`));
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        console.log(`⏰ Timeout starting ${service.name}`);
        child.kill();
        reject(new Error(`Timeout starting ${service.name}`));
      }
    }, 30000);
  });
}

// Start services sequentially
async function startAllServices() {
  const runningServices = [];
  
  try {
    for (const service of services) {
      const child = await startService(service);
      runningServices.push({ service, child });
      
      // Wait a bit between services
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 All services started successfully!');
    console.log('\n📋 Service Status:');
    runningServices.forEach(({ service }) => {
      console.log(`   ✅ ${service.name} - http://localhost:${service.port} - ${service.description}`);
    });
    
    console.log('\n🌐 API Documentation: http://localhost:3000/api/docs');
    console.log('🔍 Health Check: http://localhost:3000/health');
    console.log('\n💡 Press Ctrl+C to stop all services\n');
    
  } catch (error) {
    console.log(`\n❌ Failed to start services: ${error.message}`);
    
    // Kill any running services
    runningServices.forEach(({ child }) => {
      try {
        child.kill();
      } catch (e) {
        // Ignore errors when killing
      }
    });
    
    process.exit(1);
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down services...');
  process.exit(0);
});

// Start the services
startAllServices().catch(console.error);
