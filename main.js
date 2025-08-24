const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let fileToOpen = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // If there's a file to open (from command line or file association), open it
    if (fileToOpen) {
      openFileFromPath(fileToOpen);
      fileToOpen = null;
    } else {
      // Create new blank file
      mainWindow.webContents.send('new-file');
    }
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-file');
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: openFile
        },
        {
          type: 'separator'
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-file');
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('save-file-as');
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.zoomLevel = 0;
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            mainWindow.webContents.zoomLevel += 0.5;
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            mainWindow.webContents.zoomLevel -= 0.5;
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Markdown Editor',
              message: 'Markdown Editor v1.0.0',
              detail: 'A simple markdown file viewer built with Electron.'
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: 'About ' + app.getName(),
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide ' + app.getName(),
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function openFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      {
        name: 'Markdown Files',
        extensions: ['md', 'markdown', 'mdown', 'mkd', 'mkdn', 'mdwn', 'mdtxt', 'mdtext', 'text', 'txt']
      },
      {
        name: 'All Files',
        extensions: ['*']
      }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    openFileFromPath(result.filePaths[0]);
  }
}

function openFileFromPath(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    mainWindow.webContents.send('file-opened', {
      path: filePath,
      content: content,
      filename: path.basename(filePath)
    });
  } catch (error) {
    dialog.showErrorBox('Error', `Could not read file: ${error.message}`);
  }
}

// Handle IPC messages from renderer
ipcMain.handle('get-file-content', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle open file dialog request from renderer
ipcMain.on('open-file-dialog', async (event) => {
  await openFile();
});

// Handle save file request from renderer
ipcMain.handle('save-file', async (event, { filePath, content }) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle save file as request from renderer
ipcMain.handle('save-file-as', async (event, content) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      {
        name: 'Markdown Files',
        extensions: ['md']
      },
      {
        name: 'Text Files',
        extensions: ['txt']
      },
      {
        name: 'All Files',
        extensions: ['*']
      }
    ],
    defaultPath: 'untitled.md'
  });

  if (!result.canceled) {
    try {
      fs.writeFileSync(result.filePath, content, 'utf8');
      return {
        success: true,
        filePath: result.filePath,
        filename: path.basename(result.filePath)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: false, canceled: true };
});

// Handle file associations and command line arguments
function handleFileOpen() {
  // Check if app was opened with a file
  if (process.argv.length > 1) {
    const potentialFile = process.argv[process.argv.length - 1];
    if (potentialFile && potentialFile !== '.' && !potentialFile.startsWith('-') &&
        fs.existsSync(potentialFile) &&
        /\.(md|markdown|mdown|mkd|mkdn|mdwn|mdtxt|mdtext|txt)$/i.test(potentialFile)) {
      fileToOpen = path.resolve(potentialFile);
    }
  }
}

// App event handlers
app.whenReady().then(() => {
  handleFileOpen();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle file opened from OS (double-click, right-click open with)
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    openFileFromPath(filePath);
  } else {
    fileToOpen = filePath;
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
