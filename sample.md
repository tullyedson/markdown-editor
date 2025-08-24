# Markdown Editor Sample

Welcome to the **Markdown Editor**! This is a sample markdown file to demonstrate the application's capabilities.

## Features

This markdown editor supports:

- ✅ **Headers** (H1 through H6)
- ✅ **Bold** and *italic* text
- ✅ `Inline code` and code blocks
- ✅ Lists (ordered and unordered)
- ✅ Links and images
- ✅ Tables
- ✅ Blockquotes
- ✅ Syntax highlighting

## Code Example

Here's a JavaScript code block with syntax highlighting:

```javascript
function greetUser(name) {
    console.log(`Hello, ${name}! Welcome to Markdown Editor.`);
    
    const features = [
        'File loading',
        'Markdown rendering',
        'Syntax highlighting',
        'Zoom controls'
    ];
    
    return features;
}

greetUser('Developer');
```

## Lists

### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

## Table Example

| Feature | Status | Description |
|---------|--------|-------------|
| File Loading | ✅ Complete | Open markdown files from disk |
| Rendering | ✅ Complete | Convert markdown to HTML |
| Syntax Highlighting | ✅ Complete | Code blocks with language support |
| Zoom Controls | ✅ Complete | Adjust text size |

## Blockquote

> "The best way to get started is to quit talking and begin doing."
> 
> — Walt Disney

## Links and Images

Visit the [Markdown Guide](https://www.markdownguide.org/) for more information about markdown syntax.

## Keyboard Shortcuts

- **Ctrl+O** - Open file
- **Ctrl+R** - Refresh/reload
- **Ctrl+0** - Reset zoom
- **Ctrl++** - Zoom in
- **Ctrl+-** - Zoom out

## Mathematical Expressions

You can write mathematical expressions using LaTeX syntax:

Inline math: $E = mc^2$

Block math:
$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

## Horizontal Rule

---

## Conclusion

This markdown editor provides a clean, distraction-free environment for viewing markdown files. Enjoy exploring your documents!

### Technical Details

- Built with **Electron**
- Uses **marked.js** for markdown parsing
- **highlight.js** for syntax highlighting
- Responsive design with zoom controls
- Drag & drop file support
