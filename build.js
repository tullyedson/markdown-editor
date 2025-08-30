#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Markdown Editor Build Script');
console.log('================================');

// Get command line arguments
const args = process.argv.slice(2);
const platform = args[0] || 'current';

// Build configurations
const builds = {
  win: {
    name: 'Windows',
    command: 'npm run package:win',
    output: 'packages/MarkdownEditor-win32-x64'
  },
  mac: {
    name: 'macOS',
    command: 'npm run package:mac',
    output: 'packages/MarkdownEditor-darwin-x64'
  },
  linux: {
    name: 'Linux',
    command: 'npm run package:linux',
    output: 'packages/MarkdownEditor-linux-x64'
  },
  all: {
    name: 'All Platforms',
    command: 'npm run package:all',
    output: 'packages/'
  }
};

function executeCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function createZip(sourceDir, outputName) {
  console.log(`\n📁 Creating ZIP archive: ${outputName}...`);
  try {
    const zipCommand = process.platform === 'win32' 
      ? `powershell Compress-Archive -Path "${sourceDir}\\*" -DestinationPath "${outputName}.zip" -Force`
      : `cd "${path.dirname(sourceDir)}" && zip -r "${outputName}.zip" "${path.basename(sourceDir)}"`;
    
    execSync(zipCommand, { stdio: 'inherit' });
    console.log(`✅ ZIP archive created: ${outputName}.zip`);
    return true;
  } catch (error) {
    console.error(`❌ ZIP creation failed:`, error.message);
    return false;
  }
}

function showBuildInfo() {
  console.log('\n📋 Available build commands:');
  console.log('  node build.js win     - Build for Windows');
  console.log('  node build.js mac     - Build for macOS');
  console.log('  node build.js linux   - Build for Linux');
  console.log('  node build.js all     - Build for all platforms');
  console.log('\n📋 Manual build commands:');
  console.log('  npm run package:win   - Windows package');
  console.log('  npm run package:mac   - macOS package');
  console.log('  npm run package:linux - Linux package');
  console.log('  npm run package:all   - All platforms');
}

// Main build process
async function build() {
  if (platform === 'help' || platform === '--help' || platform === '-h') {
    showBuildInfo();
    return;
  }

  const buildConfig = builds[platform];
  
  if (!buildConfig) {
    console.error(`❌ Unknown platform: ${platform}`);
    showBuildInfo();
    process.exit(1);
  }

  console.log(`\n🎯 Building for: ${buildConfig.name}`);
  
  // Clean previous builds
  if (fs.existsSync('packages')) {
    console.log('\n🧹 Cleaning previous builds...');
    fs.rmSync('packages', { recursive: true, force: true });
  }

  // Execute build
  const success = executeCommand(buildConfig.command, `Building ${buildConfig.name}`);
  
  if (!success) {
    console.error('\n❌ Build failed!');
    process.exit(1);
  }

  // Create ZIP archives
  if (platform !== 'all') {
    const outputDir = buildConfig.output;
    if (fs.existsSync(outputDir)) {
      const zipName = path.join('packages', `MarkdownEditor-${platform}`);
      createZip(outputDir, zipName);
    }
  } else {
    // Create ZIP for each platform
    ['win32-x64', 'darwin-x64', 'linux-x64'].forEach(arch => {
      const outputDir = `packages/MarkdownEditor-${arch}`;
      if (fs.existsSync(outputDir)) {
        const zipName = path.join('packages', `MarkdownEditor-${arch}`);
        createZip(outputDir, zipName);
      }
    });
  }

  console.log('\n🎉 Build completed successfully!');
  console.log(`📁 Output directory: ${buildConfig.output}`);
  
  if (fs.existsSync('packages')) {
    console.log('\n📦 Generated files:');
    const files = fs.readdirSync('packages');
    files.forEach(file => {
      const filePath = path.join('packages', file);
      const stats = fs.statSync(filePath);
      const size = stats.isDirectory() ? 'DIR' : `${(stats.size / 1024 / 1024).toFixed(1)}MB`;
      console.log(`  ${file} (${size})`);
    });
  }
}

// Run the build
build().catch(error => {
  console.error('❌ Build script failed:', error);
  process.exit(1);
});
