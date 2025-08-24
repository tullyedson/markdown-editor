# Markdown Editor

A desktop markdown file viewer built with Electron that provides a clean, distraction-free environment for viewing markdown documents.

## Features

- 📁 **File Loading** - Open markdown files via menu, drag & drop, or keyboard shortcuts
- 🎨 **Beautiful Rendering** - Clean, GitHub-style markdown rendering
- 🔍 **Zoom Controls** - Adjust text size with zoom in/out/reset functionality
- ⌨️ **Keyboard Shortcuts** - Quick access to common functions
- 🎯 **Syntax Highlighting** - Code blocks with language-specific highlighting
- 📊 **Word Count** - Real-time statistics (words, characters, lines)
- 🖱️ **Drag & Drop** - Simply drag markdown files into the window
- 📱 **Responsive Design** - Adapts to different window sizes

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

## Installation & Usage

### Prerequisites
- Node.js (v16 or higher)
- npm

### Running the Application

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

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` (or `Cmd+O` on Mac) | Open file |
| `Ctrl+R` (or `Cmd+R` on Mac) | Refresh/reload current file |
| `Ctrl+0` (or `Cmd+0` on Mac) | Reset zoom to 100% |
| `Ctrl++` (or `Cmd++` on Mac) | Zoom in |
| `Ctrl+-` (or `Cmd+-` on Mac) | Zoom out |
| `Ctrl+Q` (or `Cmd+Q` on Mac) | Quit application |

## How to Use

1. **Launch the application** - You'll see a welcome screen with instructions
2. **Open a file** - Click "Open File" button, use Ctrl+O, or drag & drop a markdown file
3. **View your content** - The markdown will be rendered with proper formatting
4. **Navigate** - Use the toolbar buttons for zoom controls and refresh
5. **Check statistics** - Word count and file info appear in the footer

## Technical Details

### Built With
- **Electron** - Cross-platform desktop app framework
- **marked.js** - Fast markdown parser and compiler
- **highlight.js** - Syntax highlighting for code blocks
- **HTML/CSS/JavaScript** - Frontend technologies

### Architecture
- **Main Process** (`main.js`) - Handles window management, file dialogs, and system integration
- **Renderer Process** (`renderer.js`) - Manages UI interactions and markdown rendering
- **Styling** (`styles.css`) - Clean, modern interface design

### File Structure
```
markdown-editor/
├── main.js           # Main Electron process
├── renderer.js       # Renderer process (UI logic)
├── index.html        # Application UI
├── styles.css        # Application styling
├── package.json      # Project configuration
├── sample.md         # Sample markdown file
└── README.md         # This file
```

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## License

MIT License - feel free to use this project for personal or commercial purposes.
