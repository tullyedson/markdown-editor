# Markdown Editor - Project Context

## Project Overview
This is a desktop markdown file viewer/editor built with Electron. It provides a clean, distraction-free environment for viewing and editing markdown documents with live preview.

### Main Technologies
- **Electron** - Cross-platform desktop app framework
- **marked.js** - Fast markdown parser and compiler
- **highlight.js** - Syntax highlighting for code blocks
- **HTML/CSS/JavaScript** - Frontend technologies

### Architecture
- **Main Process** (`main.js`) - Handles window management, file dialogs, and system integration
- **Renderer Process** (`renderer.js`) - Manages UI interactions, markdown rendering, and editor functionality
- **Styling** (`styles.css`) - Clean, modern interface design with responsive layout

## Building and Running

### Prerequisites
- Node.js (v16 or higher)
- npm

### Development Commands
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm start
   ```

3. **Development mode (with DevTools):**
   ```bash
   npm run dev
   ```

### Building for Distribution
```bash
npm run build
```
This will create distributable packages in the `dist` folder for your platform.

## Features
- 📁 **File Loading** - Open markdown files via menu, drag & drop, or keyboard shortcuts
- ✏️ **Live Editing** - Edit markdown with live preview
- 🎨 **Beautiful Rendering** - Clean, GitHub-style markdown rendering
- 🔍 **Zoom Controls** - Adjust text size with zoom in/out/reset functionality
- ⌨️ **Keyboard Shortcuts** - Quick access to common functions
- 🎯 **Syntax Highlighting** - Code blocks with language-specific highlighting
- 📊 **Word Count** - Real-time statistics (words, characters, lines)
- 🖱️ **Drag & Drop** - Simply drag markdown files into the window
- 📱 **Responsive Design** - Adapts to different window sizes
- ↔️ **Resizable Panels** - Adjustable split view between editor and preview

## Development Conventions
- Uses standard Electron project structure with `main.js` and `renderer.js`
- UI is built with vanilla HTML/CSS/JavaScript
- Markdown rendering is handled by `marked.js` with `highlight.js` for code blocks
- Styling follows modern CSS practices with responsive design
- Follows common Electron security practices (context isolation disabled for simplicity, but could be improved)

## File Structure
```
markdown-editor/
├── main.js           # Main Electron process
├── renderer.js       # Renderer process (UI logic)
├── index.html        # Application UI
├── styles.css        # Application styling
├── package.json      # Project configuration
├── sample.md         # Sample markdown file
└── README.md         # Project documentation
```

## Supported File Types
- `.md` - Markdown
- `.markdown` - Markdown
- `.mdown` - Markdown Down
- `.mkd` - Markdown
- `.mkdn` - Markdown
- `.mdwn` - Markdown
- `.mdtxt` - Markdown Text
- `.mdtext` - Markdown Text
- `.txt` - Plain Text
- `.text` - Text

## Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+N` (or `Cmd+N` on Mac) | New file |
| `Ctrl+O` (or `Cmd+O` on Mac) | Open file |
| `Ctrl+S` (or `Cmd+S` on Mac) | Save file |
| `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac) | Save as |
| `Ctrl+R` (or `Cmd+R` on Mac) | Refresh/reload current file |
| `Ctrl+0` (or `Cmd+0` on Mac) | Reset zoom to 100% |
| `Ctrl++` (or `Cmd++` on Mac) | Zoom in |
| `Ctrl+-` (or `Cmd+-` on Mac) | Zoom out |
| `Ctrl+Q` (or `Cmd+Q` on Mac) | Quit application |