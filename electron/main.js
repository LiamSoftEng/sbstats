const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

const isDev = process.env.ELECTRON_START_URL !== undefined

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0f0f0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // allows Hypixel API calls from renderer
    },
  })

  if (isDev) {
    win.loadURL(process.env.ELECTRON_START_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Open external links in system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
