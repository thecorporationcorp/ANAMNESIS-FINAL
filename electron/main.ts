import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { join } from 'path'
import { initDatabase, getMemories, searchMemories, getMemory, getStats } from './services/database'
import { importExportFile } from './services/importer'

let mainWindow: BrowserWindow | null = null

const isDev = !app.isPackaged

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow() {
  // Prevent creating multiple windows
  if (mainWindow) {
    return
  }

  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1280,
    minHeight: 720,
    frame: false, // Frameless UI
    transparent: false,
    backgroundColor: '#000000',
    icon: join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Required for better-sqlite3
      devTools: false, // COMPLETELY DISABLE DEVTOOLS
    },
    show: false // Prevent white flash on startup
  })

  // Start maximized
  mainWindow.maximize()

  // Only show after fully ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // CRITICAL: Prevent ANY DevTools from opening
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow?.webContents.closeDevTools()
  })

  // Dev vs production loading
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // Force external URLs to default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(() => {
  // Initialize database on startup
  initDatabase()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// -----------------------------
// IPC: Window controls
// -----------------------------
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false
})

// -----------------------------
// IPC: Database handlers (PRODUCTION)
// -----------------------------
ipcMain.handle('db:getMemories', async (_event, options) => {
  try {
    return getMemories(options)
  } catch (error) {
    console.error('Failed to get memories:', error)
    return []
  }
})

ipcMain.handle('db:searchMemories', async (_event, query) => {
  try {
    return searchMemories(query)
  } catch (error) {
    console.error('Failed to search memories:', error)
    return []
  }
})

ipcMain.handle('db:getMemory', async (_event, id) => {
  try {
    return getMemory(id)
  } catch (error) {
    console.error('Failed to get memory:', error)
    return null
  }
})

ipcMain.handle('db:importExport', async (_event, filePath) => {
  try {
    return await importExportFile(filePath)
  } catch (error) {
    console.error('Import failed:', error)
    return {
      success: false,
      message: `Import failed: ${(error as Error).message}`,
    }
  }
})

// -----------------------------
// IPC: Statistics
// -----------------------------
ipcMain.handle('db:getStats', async () => {
  try {
    return getStats()
  } catch (error) {
    console.error('Failed to get stats:', error)
    return {
      totalMemories: 0,
      totalWords: 0,
      platforms: {},
      topTopics: [],
    }
  }
})

// -----------------------------
// IPC: File export dialog
// -----------------------------
ipcMain.handle('file:selectExport', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Export Files', extensions: ['json', 'zip'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  return result.canceled ? null : result.filePaths[0]
})

// -----------------------------
// IPC: App info
// -----------------------------
ipcMain.handle('app:getInfo', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
    isDev
  }
})
