const path = require('path')
const { app, shell, BrowserWindow, Menu, Tray } = require('electron')
const electronDebug = require('electron-debug')
const { autoUpdater } = require('electron-updater')
const { is } = require('electron-util')
const menu = require('./menu')

electronDebug({
  enabled: true,
  showDevTools: false
})

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
      mainWindow.blur()
      mainWindow.hide()
    }
  })

  mainWindow.on('page-title-updated', (e, title) => {
    let unreadCount = /^.+\s\((\d+[,]?\d*)\)/.exec(title)
    unreadCount = unreadCount && unreadCount[1]

    if (is.macos) {
      app.dock.setBadge(unreadCount || '')
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
