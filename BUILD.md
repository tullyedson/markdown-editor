# Building Markdown Editor

This document explains how to build and package the Markdown Editor for different platforms.

## Prerequisites

- Node.js (v16 or higher)
- npm
- For macOS builds: Xcode Command Line Tools
- For Windows builds: Windows SDK (optional, for code signing)

## Installation

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd markdown-editor
npm install
```

## Development

Run the application in development mode:
```bash
npm run dev
```

## Building for Distribution

### Quick Build (Recommended)

Use the build script for easy packaging:

```bash
# Build for current platform
node build.js

# Build for specific platform
node build.js win     # Windows
node build.js mac     # macOS
node build.js linux   # Linux
node build.js all     # All platforms
```

### Manual Building

#### Windows
```bash
npm run package:win
```
Creates: `packages/MarkdownEditor-win32-x64/`

#### macOS
```bash
npm run package:mac
```
Creates: `packages/MarkdownEditor-darwin-x64/`

#### Linux
```bash
npm run package:linux
```
Creates: `packages/MarkdownEditor-linux-x64/`

#### All Platforms
```bash
npm run package:all
```

### Advanced Building (electron-builder)

For installer packages:
```bash
npm run build:win    # Windows NSIS installer
npm run build:mac    # macOS DMG
npm run build:linux  # Linux AppImage/DEB
```

Note: electron-builder may require additional setup for code signing.

## Output Directories

- **electron-packager**: `packages/` directory
- **electron-builder**: `dist/` directory
- **Build script**: Creates ZIP archives in `packages/`

## Mobile Support

Currently, this is an Electron desktop application. For mobile support, consider:

1. **Progressive Web App (PWA)**: Convert to a web app with offline capabilities
2. **Capacitor**: Wrap the web app for iOS/Android
3. **React Native/Flutter**: Rewrite for native mobile development

## Notes

- Icons should be placed in the `assets/` directory
- Windows builds require `icon.ico`
- macOS builds require `icon.icns`
- Linux builds require `icon.png`
- Code signing certificates can be configured in environment variables
