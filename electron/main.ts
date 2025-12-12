import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null

const isDev = !app.isPackaged

function createWindow() {
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
      sandbox: false // Required for better-sqlite3
    },
    show: false // Prevent white flash on startup
  })

  // Start maximized
  mainWindow.maximize()

  // Only show after fully ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Dev vs production loading
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
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
// IPC: Database placeholder handlers
// -----------------------------
ipcMain.handle('db:getMemories', async () => {
  return []
})

ipcMain.handle('db:searchMemories', async (_event, query) => {
  return []
})

ipcMain.handle('db:getMemory', async (_event, id) => {
  return null
})

ipcMain.handle('db:importExport', async (_event, filePath) => {
  return { success: false, message: 'Not implemented' }
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
