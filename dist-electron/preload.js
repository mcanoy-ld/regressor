import { contextBridge as e } from "electron";
e.exposeInMainWorld("electronAPI", {
  // Add any methods you want to expose to the renderer here
  // Example:
  // sendMessage: (message: string) => ipcRenderer.send('message', message)
});
