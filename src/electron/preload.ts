import { contextBridge } from 'electron'

// Expose any APIs to the renderer process here
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any methods you want to expose to the renderer here
  // Example:
  // sendMessage: (message: string) => ipcRenderer.send('message', message)
} as const)

// TypeScript interface for the exposed API
declare global {
  interface Window {
    electronAPI: Record<string, never> // Empty object type that's more strictly typed
  }
}
