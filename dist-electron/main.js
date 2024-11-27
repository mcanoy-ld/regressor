import { app as e, BrowserWindow as a } from "electron";
import n from "path";
import { fileURLToPath as l } from "url";
const r = l(import.meta.url), t = n.dirname(r);
function i() {
  const o = new a({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      preload: n.join(t, "preload.js")
    }
  });
  process.env.NODE_ENV === "development" ? (o.loadURL("http://localhost:5175"), o.webContents.openDevTools()) : o.loadFile(n.join(t, "../dist/index.html"));
}
e.whenReady().then(() => {
  i(), e.on("activate", () => {
    a.getAllWindows().length === 0 && i();
  });
});
e.on("window-all-closed", () => {
  process.platform !== "darwin" && e.quit();
});
