const { app, shell, BrowserWindow, Menu } = require('electron')
const electronDebug = require('electron-debug')
const { autoUpdater } = require('electron-updater')
const isDev = require('electron-is-dev')
const menu = require('./menu')

electronDebug({
  enabled: true,
  showDevTools: false
})

if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify()
}

let mainWindow
let replyToWindow
let isQuitting = false

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.show()
  }
})

function updateBadge(title) {
  const unreadCount = /^.+\s\((\d+[,]?\d*)\)/.exec(title)
  if (process.platform === 'darwin') {
    app.dock.setBadge(unreadCount ? unreadCount[1] : '')
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: app.getName(),
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: true
    }
  })

  mainWindow.loadURL('https://mail.google.com')

  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault()
      if (process.platform === 'darwin') {
        app.hide()
      } else {
        mainWindow.hide()
      }
    }
  })

  mainWindow.on('page-title-updated', (e, title) => updateBadge(title))
}

function createMailTo(url) {
  replyToWindow = new BrowserWindow({
    parent: mainWindow
  })

  replyToWindow.loadURL(
    `https://mail.google.com/mail/?extsrc=mailto&url=${url}`
  )
}

app.on('ready', () => {
  createWindow()
  Menu.setApplicationMenu(menu)

  const { webContents } = mainWindow

  webContents.on('dom-ready', () => {
    mainWindow.show()
  })

  webContents.on(
    'new-window',
    (event, url, frameName, disposition, options) => {
      event.preventDefault()

      if (/^(https:\/\/(mail|accounts)\.google\.com).*/.test(url)) {
        event.newGuest = new BrowserWindow(options)
      } else {
        shell.openExternal(url)
      }
    }
  )
})

app.on('open-url', (event, url) => {
  event.preventDefault()
  createMailTo(url)
})

app.on('activate', () => {
  mainWindow.show()
})

app.on('before-quit', () => {
  isQuitting = true
})
