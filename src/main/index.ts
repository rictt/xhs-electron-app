import { app, shell, BrowserWindow, protocol, net, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { systemDb } from './lowdb'
import { registerIpcMainEvent } from './ipc'
import log from 'electron-log/main'

log.initialize()

log.info('main start')

function registerShortCut() {
  globalShortcut.register('CommandOrControl+Alt+K', () => {
    // 获取当前窗口
    BrowserWindow.getFocusedWindow().webContents.openDevTools()
  })
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 870,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', async () => {
    log.info('ready-to-show')
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  protocol.handle('xhsimage', (request) => {
    return net.fetch('file://' + request.url.slice('xhsimage://'.length))
  })
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  registerIpcMainEvent()

  registerShortCut()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', async () => {
  app.quit()
})

app.on('ready', async () => {
  await systemDb.init()
  await systemDb.db.read()
  systemDb.data.notes.forEach((note) => {
    note.status = 'idle'
  })
  await systemDb.db.write()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
