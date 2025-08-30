# Markdown Editor - Distribution Guide

## 📦 Available Packages

The Markdown Editor can be packaged for multiple platforms:

### Desktop Platforms ✅

- **Windows** (x64)
  - Portable executable
  - NSIS installer (advanced)
  
- **macOS** (x64, ARM64)
  - App bundle
  - DMG installer (advanced)
  
- **Linux** (x64)
  - Portable directory
  - AppImage (advanced)
  - DEB package (advanced)

### Mobile Platforms 📱

Currently not available, but can be implemented using:
- Progressive Web App (PWA)
- Capacitor (Ionic)
- React Native (rewrite)
- Flutter (rewrite)

See `MOBILE.md` for detailed mobile development guide.

## 🚀 Quick Start

### Build for Current Platform
```bash
node build.js
```

### Build for Specific Platform
```bash
node build.js win     # Windows
node build.js mac     # macOS
node build.js linux   # Linux
node build.js all     # All platforms
```

## 📁 Output Structure

```
packages/
├── MarkdownEditor-win32-x64/          # Windows app directory
│   ├── MarkdownEditor.exe             # Main executable
│   ├── resources/                     # App resources
│   └── ...                           # Electron runtime files
├── MarkdownEditor-darwin-x64/         # macOS app directory
├── MarkdownEditor-linux-x64/          # Linux app directory
├── MarkdownEditor-win.zip             # Windows ZIP archive
├── MarkdownEditor-mac.zip             # macOS ZIP archive
└── MarkdownEditor-linux.zip           # Linux ZIP archive
```

## 🎯 Distribution Methods

### 1. Direct Download
- Upload ZIP files to GitHub releases
- Host on your website
- Share via cloud storage

### 2. App Stores (Advanced)
- Microsoft Store (Windows)
- Mac App Store (macOS)
- Snap Store (Linux)
- Various Linux repositories

### 3. Package Managers
- Chocolatey (Windows)
- Homebrew (macOS)
- APT/YUM (Linux)

## 🔧 Build Requirements

### All Platforms
- Node.js 16+
- npm

### Platform-Specific
- **Windows**: No additional requirements
- **macOS**: Xcode Command Line Tools (for building on macOS)
- **Linux**: Standard build tools

## 📋 Build Commands Reference

### Simple Packaging (electron-packager)
```bash
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
npm run package:all    # All platforms
```

### Advanced Packaging (electron-builder)
```bash
npm run build:win      # Windows installer
npm run build:mac      # macOS DMG
npm run build:linux    # Linux AppImage/DEB
npm run build:all      # All installers
```

### Build Script (Recommended)
```bash
node build.js [platform]  # Automated building with ZIP creation
```

## 📊 Package Sizes

Approximate sizes for packaged applications:

- **Windows**: ~210MB (ZIP), ~85MB (installer)
- **macOS**: ~220MB (ZIP), ~90MB (DMG)
- **Linux**: ~200MB (ZIP), ~80MB (AppImage)

## 🔐 Code Signing

For production distribution, consider code signing:

- **Windows**: Authenticode certificate
- **macOS**: Apple Developer certificate
- **Linux**: GPG signing

## 🚀 Deployment Checklist

- [ ] Test on target platforms
- [ ] Update version numbers
- [ ] Add/update application icons
- [ ] Configure code signing (production)
- [ ] Create release notes
- [ ] Upload to distribution channels
- [ ] Update documentation

## 📞 Support

For build issues:
1. Check `BUILD.md` for detailed instructions
2. Verify Node.js and npm versions
3. Clear `node_modules` and reinstall
4. Check platform-specific requirements
