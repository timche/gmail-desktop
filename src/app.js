const path = require('path')
const {
  app,
  ipcMain: ipc,
  shell,
  BrowserWindow,
  Menu,
  Tray
} = require('electron')
const fs = require('fs')
const { autoUpdater } = require('electron-updater')
const { is } = require('electron-util')

// Initialize the debug mode handler when starting the app
require('./debug').init()

const menu = require('./menu')
const WindowState = require('./state/window')

if (!is.development) {
  autoUpdater.checkForUpdatesAndNotify()
}

app.setAppUserModelId('io.cheung.gmail-desktop')

let mainWindow
let replyToWindow
let isQuitting = false
let tray

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

function createWindow() {
  mainWindow = new BrowserWindow({
    title: app.getName(),
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Use the window state to set the mainWindow bounds
  WindowState.use('main', mainWindow)

  mainWindow.loadURL('https://mail.google.com')

  mainWindow.webContents.on('dom-ready', () => {
    fs.readFile(
      path.join(__dirname, '..', 'static', 'style.css'),
      'utf-8',
      (error, data) => {
        if (!error) {
          const formattedData = data.replace(/\s{2,10}/g, ' ').trim()
          mainWindow.webContents.insertCSS(formattedData)
        }
      }
    )
  })

  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.blur()
      mainWindow.hide()
    }
  })

  ipc.on('unread-count', (_, unreadCount) => {
    if (is.macos) {
      app.dock.setBadge(unreadCount ? unreadCount.toString() : '')
    }

    if ((is.linux || is.windows) && tray) {
      const icon = unreadCount ? 'tray-icon-unread.png' : 'tray-icon.png'
      const iconPath = path.join(__dirname, '..', 'static', icon)

      tray.setImage(iconPath)
    }
  })
}

function createMailto(url) {
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

  if ((is.linux || is.windows) && !tray) {
    const appName = app.getName()
    const iconPath = path.join(__dirname, '..', 'static', 'tray-icon.png')

    const contextMenuTemplate = [
      {
        role: 'quit'
      }
    ]

    if (is.linux) {
      contextMenuTemplate.unshift({
        label: 'Show',
        click: () => {
          mainWindow.show()
        }
      })
    }

    const contextMenu = Menu.buildFromTemplate(contextMenuTemplate)

    tray = new Tray(iconPath)
    tray.setToolTip(appName)
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
      mainWindow.show()
    })
  }

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
  createMailto(url)
})

app.on('activate', () => {
  mainWindow.show()
})

app.on('before-quit', () => {
  isQuitting = true
})
