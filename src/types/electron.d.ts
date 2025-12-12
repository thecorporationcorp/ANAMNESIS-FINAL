// Electron API type definitions

export interface ElectronAPI {
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  db: {
    getMemories: (options?: {
      limit?: number
      offset?: number
      filter?: string
    }) => Promise<any[]>
    searchMemories: (query: string) => Promise<any[]>
    getMemory: (id: string) => Promise<any | null>
    importExport: (filePath: string) => Promise<{
      success: boolean
      message: string
    }>
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

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
