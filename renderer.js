const { ipcRenderer } = require('electron');
const path = require('path');

// DOM elements
const splitContainer = document.getElementById('split-container');
const editorPanel = document.getElementById('editor-panel');
const previewPanel = document.getElementById('preview-panel');
const splitter = document.getElementById('splitter');
const markdownEditor = document.getElementById('markdown-editor');
const wysiwygContainer = document.getElementById('wysiwyg-editor');
const currentFileSpan = document.getElementById('current-file');

// Toolbar buttons
const newFileBtn = document.getElementById('new-file-btn');
const openFileBtn = document.getElementById('open-file-btn');
const saveFileBtn = document.getElementById('save-file-btn');
const saveAsBtn = document.getElementById('save-as-btn');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomResetBtn = document.getElementById('zoom-reset-btn');
const toggleMarkdownBtn = document.getElementById('toggle-markdown');
const syncToWysiwygBtn = document.getElementById('sync-to-wysiwyg');
const syncToMarkdownBtn = document.getElementById('sync-to-markdown');
const loadingOverlay = document.getElementById('loading-overlay');
const wordCountSpan = document.getElementById('word-count');

// Application state
let currentFilePath = null;
let currentFileContent = null;
let zoomLevel = 1;
let isModified = false;
let isDragging = false;
let contentLoaded = false;
let quillEditor = null;
let turndownService = null;
let isUpdatingFromMarkdown = false;
let isUpdatingFromWysiwyg = false;

// Configure marked options
marked.setOptions({
    highlight: function(code, lang) {
        // Debug output
        console.log('Highlight function called with lang:', lang);
        console.log('hljs available:', typeof hljs !== 'undefined');
        
        if (typeof hljs === 'undefined') {
            console.warn('highlight.js not available, returning plain code');
            return '';
        }
        
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (err) {
                console.error('Highlight.js error:', err);
            }
        }
        try {
            return hljs.highlightAuto(code).value;
        } catch (err) {
            console.error('Highlight.js auto-detection error:', err);
            return '';
        }
    },
    breaks: true,
    gfm: true,
    tables: true,
    sanitize: false
});

// Initialize the application
function init() {
    console.log('Initializing application...');
    console.log('hljs available at init:', typeof hljs !== 'undefined');
    console.log('marked available at init:', typeof marked !== 'undefined');

    // Ensure all dependencies are loaded before proceeding
    if (typeof marked === 'undefined') {
        console.warn('marked.js not loaded yet, retrying...');
        setTimeout(init, 50);
        return;
    }

    setupEventListeners();
    setupSplitter();
    initializeWysiwygEditor();

    // Don't update preview yet - wait for content to be loaded by createNewFile()
    // updatePreview() will be called after the editor content is set
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

    // WYSIWYG controls
    toggleMarkdownBtn.addEventListener('click', toggleMarkdownPanel);
    syncToWysiwygBtn.addEventListener('click', syncMarkdownToWysiwyg);
    syncToMarkdownBtn.addEventListener('click', syncWysiwygToMarkdown);

    // IPC listeners
    ipcRenderer.on('file-opened', handleFileOpened);
    ipcRenderer.on('new-file', createNewFile);
    ipcRenderer.on('new-blank-file', createBlankFile);
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

    // Always update preview when creating new file
    updatePreview();
    contentLoaded = true;

    // Ensure WYSIWYG is synced after content is set
    setTimeout(() => {
        if (quillEditor) {
            syncMarkdownToWysiwyg();
        }
    }, 100);

    updateFileInfo('Untitled.md', null);
    setModified(false);
    markdownEditor.focus();
}

// Handle editor input
function handleEditorInput() {
    if (!isUpdatingFromWysiwyg) {
        updatePreview();
        setModified(true);
    }
}

// Update preview
function updatePreview() {
    console.log('Updating preview...');
    const content = markdownEditor.value;
    renderMarkdown(content);
    updateWordCount(content);

    // Also sync to WYSIWYG editor if it's initialized
    if (quillEditor && !isUpdatingFromWysiwyg) {
        syncMarkdownToWysiwyg();
    }
}

// Set modified state
function setModified(modified) {
    isModified = modified;
    const title = currentFilePath ?
        `${path.basename(currentFilePath)}${modified ? ' •' : ''} - Markdown Editor` :
        `Untitled.md${modified ? ' •' : ''} - Markdown Editor`;
    document.title = title;
}

// Render markdown content (now handled by WYSIWYG editor)
function renderMarkdown(content) {
    console.log('Rendering markdown... (handled by WYSIWYG editor)');
    // The WYSIWYG editor now handles the rendering
    // This function is kept for compatibility but doesn't do the old HTML rendering
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
    if (currentFileSpan) {
        currentFileSpan.textContent = filename;
        currentFileSpan.title = filepath;
    }
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
        .replace(/\[([^\]]*)\]\(([^)]*)\)/g, '$1') // Replace links with text
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

// Initialize WYSIWYG Editor
function initializeWysiwygEditor() {
    console.log('Initializing WYSIWYG editor...');

    // Initialize Turndown service for HTML to Markdown conversion
    turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
    });

    // Initialize Quill editor
    quillEditor = new Quill('#wysiwyg-editor', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ],
                handlers: {
                    'image': function() {
                        const range = this.quill.getSelection();
                        const input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');
                        input.click();

                        input.onchange = () => {
                            const file = input.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const imageUrl = e.target.result;
                                    this.quill.insertEmbed(range.index, 'image', imageUrl, 'user');
                                };
                                reader.readAsDataURL(file);
                            }
                        };
                    }
                }
            }
        },
        placeholder: 'Start editing in WYSIWYG mode...'
    });

    // Add tooltips to toolbar buttons
    setTimeout(() => {
        addToolbarTooltips();
    }, 100);

    // Listen for changes in the WYSIWYG editor
    quillEditor.on('text-change', function(delta, oldDelta, source) {
        if (source === 'user' && !isUpdatingFromMarkdown) {
            isUpdatingFromWysiwyg = true;
            syncWysiwygToMarkdown();
            setModified(true);
            setTimeout(() => {
                isUpdatingFromWysiwyg = false;
            }, 100);
        }
    });

    console.log('WYSIWYG editor initialized');

    // Initial sync after a brief delay to ensure everything is ready
    setTimeout(() => {
        if (markdownEditor.value) {
            console.log('Performing initial sync to WYSIWYG...');
            syncMarkdownToWysiwyg();
        }
    }, 200);
}

// Sync markdown content to WYSIWYG editor
function syncMarkdownToWysiwyg() {
    if (!quillEditor || isUpdatingFromWysiwyg) return;

    console.log('Syncing markdown to WYSIWYG...');
    isUpdatingFromMarkdown = true;

    try {
        const markdownText = markdownEditor.value;
        console.log('Markdown content to sync:', markdownText);
        const html = marked.parse(markdownText);
        console.log('Generated HTML:', html);

        // Use Quill's clipboard API for better HTML insertion
        const delta = quillEditor.clipboard.convert(html);
        quillEditor.setContents(delta, 'silent');

        console.log('WYSIWYG editor updated');
    } catch (error) {
        console.error('Error syncing markdown to WYSIWYG:', error);
    }

    setTimeout(() => {
        isUpdatingFromMarkdown = false;
    }, 100);
}

// Sync WYSIWYG content to markdown
function syncWysiwygToMarkdown() {
    if (!quillEditor || !turndownService || isUpdatingFromMarkdown) return;

    console.log('Syncing WYSIWYG to markdown...');
    isUpdatingFromWysiwyg = true;

    try {
        const html = quillEditor.root.innerHTML;
        const markdown = turndownService.turndown(html);
        markdownEditor.value = markdown;
        updateWordCount(markdown);
    } catch (error) {
        console.error('Error syncing WYSIWYG to markdown:', error);
    }

    setTimeout(() => {
        isUpdatingFromWysiwyg = false;
    }, 100);
}

// Toggle markdown panel visibility
function toggleMarkdownPanel() {
    const editorPanel = document.getElementById('editor-panel');
    const previewPanel = document.getElementById('preview-panel');
    const splitter = document.getElementById('splitter');

    if (editorPanel.classList.contains('visible')) {
        // Hide markdown panel
        editorPanel.classList.remove('visible');
        previewPanel.classList.remove('split');
        splitter.style.display = 'none';
        syncToWysiwygBtn.style.display = 'none';
        syncToMarkdownBtn.style.display = 'none';
        toggleMarkdownBtn.title = 'Show Markdown Panel';
    } else {
        // Show markdown panel
        editorPanel.classList.add('visible');
        previewPanel.classList.add('split');
        splitter.style.display = 'block';
        syncToWysiwygBtn.style.display = 'inline-block';
        syncToMarkdownBtn.style.display = 'inline-block';
        toggleMarkdownBtn.title = 'Hide Markdown Panel';

        // Sync content when showing markdown panel
        syncWysiwygToMarkdown();
    }
}

// Create blank file (no placeholder content)
function createBlankFile() {
    if (isModified) {
        const result = confirm('You have unsaved changes. Are you sure you want to create a new file?');
        if (!result) return;
    }

    currentFilePath = null;
    currentFileContent = '';
    markdownEditor.value = '';

    // Clear WYSIWYG editor
    if (quillEditor) {
        quillEditor.setContents([]);
    }

    updateFileInfo('Untitled.md', null);
    setModified(false);
    markdownEditor.focus();
}

// Add tooltips to Quill toolbar
function addToolbarTooltips() {
    const toolbar = document.querySelector('.ql-toolbar');
    if (!toolbar) return;

    const tooltips = {
        '.ql-header[value="1"]': 'Heading 1',
        '.ql-header[value="2"]': 'Heading 2',
        '.ql-header[value="3"]': 'Heading 3',
        '.ql-header[value="false"]': 'Normal text',
        '.ql-bold': 'Bold',
        '.ql-italic': 'Italic',
        '.ql-underline': 'Underline',
        '.ql-strike': 'Strikethrough',
        '.ql-blockquote': 'Quote',
        '.ql-code-block': 'Code block',
        '.ql-list[value="ordered"]': 'Numbered list',
        '.ql-list[value="bullet"]': 'Bullet list',
        '.ql-link': 'Insert link',
        '.ql-image': 'Insert image',
        '.ql-clean': 'Remove formatting'
    };

    Object.entries(tooltips).forEach(([selector, tooltip]) => {
        const element = toolbar.querySelector(selector);
        if (element) {
            element.title = tooltip;
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
