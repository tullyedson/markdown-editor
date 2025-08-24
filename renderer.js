const { ipcRenderer } = require('electron');
const path = require('path');

// DOM elements
const splitContainer = document.getElementById('split-container');
const editorPanel = document.getElementById('editor-panel');
const previewPanel = document.getElementById('preview-panel');
const splitter = document.getElementById('splitter');
const markdownEditor = document.getElementById('markdown-editor');
const markdownContent = document.getElementById('markdown-content');
const currentFileSpan = document.getElementById('current-file');

// Toolbar buttons
const newFileBtn = document.getElementById('new-file-btn');
const openFileBtn = document.getElementById('open-file-btn');
const saveFileBtn = document.getElementById('save-file-btn');
const saveAsBtn = document.getElementById('save-as-btn');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomResetBtn = document.getElementById('zoom-reset-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const wordCountSpan = document.getElementById('word-count');

// Application state
let currentFilePath = null;
let currentFileContent = null;
let zoomLevel = 1;
let isModified = false;
let isDragging = false;

// Configure marked options
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (err) {
                console.error('Highlight.js error:', err);
            }
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true,
    tables: true,
    sanitize: false
});

// Initialize the application
function init() {
    setupEventListeners();
    setupSplitter();
    // Start with default content
    updatePreview();
}

// Set up event listeners
function setupEventListeners() {
    // File operations
    newFileBtn.addEventListener('click', createNewFile);
    openFileBtn.addEventListener('click', () => {
        ipcRenderer.send('open-file-dialog');
    });
    saveFileBtn.addEventListener('click', saveFile);
    saveAsBtn.addEventListener('click', saveFileAs);

    // Editor events
    markdownEditor.addEventListener('input', handleEditorInput);
    markdownEditor.addEventListener('scroll', syncScroll);
    
    // Zoom controls
    zoomInBtn.addEventListener('click', () => adjustZoom(0.1));
    zoomOutBtn.addEventListener('click', () => adjustZoom(-0.1));
    zoomResetBtn.addEventListener('click', resetZoom);

    // IPC listeners
    ipcRenderer.on('file-opened', handleFileOpened);
    ipcRenderer.on('new-file', createNewFile);
    ipcRenderer.on('save-file', saveFile);
    ipcRenderer.on('save-file-as', saveFileAs);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Drag and drop support
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('drop', handleFileDrop);

    // Window close handling
    window.addEventListener('beforeunload', (e) => {
        if (isModified) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Handle file opened from main process
function handleFileOpened(event, fileData) {
    const { path, content, filename } = fileData;
    currentFilePath = path;
    currentFileContent = content;

    markdownEditor.value = content;
    updatePreview();
    updateFileInfo(filename, path);
    setModified(false);
}

// Handle drag and drop
function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const markdownFile = files.find(file =>
        file.name.match(/\.(md|markdown|mdown|mkd|mkdn|mdwn|mdtxt|mdtext|txt)$/i)
    );

    if (markdownFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            currentFilePath = markdownFile.path || markdownFile.name;
            currentFileContent = content;

            markdownEditor.value = content;
            updatePreview();
            updateFileInfo(markdownFile.name, currentFilePath);
            setModified(false);
        };
        reader.readAsText(markdownFile);
    }
}

// Create new file
function createNewFile() {
    if (isModified) {
        const result = confirm('You have unsaved changes. Are you sure you want to create a new file?');
        if (!result) return;
    }

    currentFilePath = null;
    currentFileContent = '';
    markdownEditor.value = markdownEditor.placeholder;
    updatePreview();
    updateFileInfo('Untitled.md', null);
    setModified(false);
    markdownEditor.focus();
}

// Handle editor input
function handleEditorInput() {
    updatePreview();
    setModified(true);
}

// Update preview
function updatePreview() {
    const content = markdownEditor.value;
    renderMarkdown(content);
    updateWordCount(content);
}

// Set modified state
function setModified(modified) {
    isModified = modified;
    const title = currentFilePath ?
        `${path.basename(currentFilePath)}${modified ? ' •' : ''} - Markdown Editor` :
        `Untitled.md${modified ? ' •' : ''} - Markdown Editor`;
    document.title = title;
}

// Render markdown content
function renderMarkdown(content) {
    try {
        const html = marked.parse(content);
        markdownContent.innerHTML = html;

        // Apply syntax highlighting to code blocks if hljs is available
        if (typeof hljs !== 'undefined' && hljs.highlightElement) {
            markdownContent.querySelectorAll('pre code').forEach((block) => {
                try {
                    hljs.highlightElement(block);
                } catch (highlightError) {
                    console.warn('Syntax highlighting failed for block:', highlightError);
                }
            });
        } else {
            console.warn('highlight.js not available, skipping syntax highlighting');
        }

        // Scroll to top
        markdownContent.scrollTop = 0;

    } catch (error) {
        console.error('Error rendering markdown:', error);
        markdownContent.innerHTML = `
            <div style="color: #dc3545; padding: 20px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">
                <h3>Error rendering markdown</h3>
                <p>${error.message}</p>
                <pre style="background-color: #ffffff; padding: 10px; margin-top: 10px; border-radius: 4px;">${escapeHtml(content)}</pre>
            </div>
        `;
    }
}

// Save file
async function saveFile() {
    if (!currentFilePath) {
        return saveFileAs();
    }

    const content = markdownEditor.value;
    const result = await ipcRenderer.invoke('save-file', {
        filePath: currentFilePath,
        content: content
    });

    if (result.success) {
        currentFileContent = content;
        setModified(false);
    } else {
        alert(`Error saving file: ${result.error}`);
    }
}

// Save file as
async function saveFileAs() {
    const content = markdownEditor.value;
    const result = await ipcRenderer.invoke('save-file-as', content);

    if (result.success && !result.canceled) {
        currentFilePath = result.filePath;
        currentFileContent = content;
        updateFileInfo(result.filename, result.filePath);
        setModified(false);
    } else if (result.error) {
        alert(`Error saving file: ${result.error}`);
    }
}

// Update file information display
function updateFileInfo(filename, filepath) {
    currentFileSpan.textContent = filename;
    currentFileSpan.title = filepath;
}

// Setup splitter functionality
function setupSplitter() {
    let startX = 0;
    let startLeftWidth = 0;

    splitter.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startLeftWidth = editorPanel.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        document.addEventListener('mousemove', handleSplitterDrag);
        document.addEventListener('mouseup', handleSplitterEnd);
    });

    function handleSplitterDrag(e) {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const newLeftWidth = startLeftWidth + deltaX;
        const containerWidth = splitContainer.offsetWidth;
        const minWidth = 300;
        const maxWidth = containerWidth - minWidth - 4; // 4px for splitter

        if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
            const leftPercent = (newLeftWidth / containerWidth) * 100;
            const rightPercent = 100 - leftPercent - (4 / containerWidth * 100); // Account for splitter

            editorPanel.style.flex = `0 0 ${leftPercent}%`;
            previewPanel.style.flex = `0 0 ${rightPercent}%`;
        }
    }

    function handleSplitterEnd() {
        isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        document.removeEventListener('mousemove', handleSplitterDrag);
        document.removeEventListener('mouseup', handleSplitterEnd);
    }
}

// Sync scroll between editor and preview
function syncScroll() {
    // Optional: implement scroll synchronization
    // This would require more complex logic to map editor lines to preview elements
}

function showLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Zoom functionality
function adjustZoom(delta) {
    zoomLevel = Math.max(0.5, Math.min(3, zoomLevel + delta));
    applyZoom();
}

function resetZoom() {
    zoomLevel = 1;
    applyZoom();
}

function applyZoom() {
    markdownContent.style.fontSize = `${zoomLevel}em`;
}

// Word count functionality
function updateWordCount(content) {
    if (!content) {
        wordCountSpan.textContent = '';
        return;
    }
    
    // Remove markdown syntax for more accurate word count
    const plainText = content
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]*`/g, '') // Remove inline code
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Replace links with text
        .replace(/[#*_~`]/g, '') // Remove markdown formatting
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    
    const words = plainText ? plainText.split(/\s+/).length : 0;
    const chars = content.length;
    const lines = content.split('\n').length;
    
    wordCountSpan.textContent = `${words} words, ${chars} characters, ${lines} lines`;
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                createNewFile();
                break;
            case 'o':
                e.preventDefault();
                // File open is handled by main process menu
                break;
            case 's':
                e.preventDefault();
                if (e.shiftKey) {
                    saveFileAs();
                } else {
                    saveFile();
                }
                break;
            case '0':
                e.preventDefault();
                resetZoom();
                break;
            case '=':
            case '+':
                e.preventDefault();
                adjustZoom(0.1);
                break;
            case '-':
                e.preventDefault();
                adjustZoom(-0.1);
                break;
        }
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
