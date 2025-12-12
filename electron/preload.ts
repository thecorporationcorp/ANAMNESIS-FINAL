import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized')
  },

  // Database operations
  db: {
    getMemories: (options?: { limit?: number; offset?: number; filter?: string }) =>
      ipcRenderer.invoke('db:getMemories', options),
    searchMemories: (query: string) =>
      ipcRenderer.invoke('db:searchMemories', query),
    getMemory: (id: string) =>
      ipcRenderer.invoke('db:getMemory', id),
    importExport: (filePath: string) =>
      ipcRenderer.invoke('db:importExport', filePath)
  },

  // File operations
  file: {
    selectExport: () => ipcRenderer.invoke('file:selectExport')
  },

  // App info
  app: {
    getInfo: () => ipcRenderer.invoke('app:getInfo')
  }
})

// Type definitions for the exposed API
export interface ElectronAPI {
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  db: {
    getMemories: (options?: { limit?: number; offset?: number; filter?: string }) => Promise<Memory[]>
    searchMemories: (query: string) => Promise<Memory[]>
    getMemory: (id: string) => Promise<Memory | null>
    importExport: (filePath: string) => Promise<{ success: boolean; message: string }>
  }
  file: {
    selectExport: () => Promise<string | null>
  }
  app: {
    getInfo: () => Promise<{
      version: string
      name: string
      platform: string
      isDev: boolean
    }>
  }
}

interface Memory {
  id: string
  title: string
  conversation: string
  userMessages: string[]
  timestamp: Date
  platform: string
  topic: string
  tags: string[]
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
