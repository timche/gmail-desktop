import { join as joinPath } from 'path'
import {
  app,
  ipcMain as ipc,
  shell,
  BrowserWindow,
  Menu,
  Tray,
  MenuItemConstructorOptions
} from 'electron'
import { autoUpdater } from 'electron-updater'
import { is } from 'electron-util'

import { init as initDebug } from './debug'
import menu from './menu'
import WindowState from './state/window'

// Initialize the debug mode handler when starting the app
initDebug()

if (!is.development) {
  autoUpdater.checkForUpdatesAndNotify()
}

app.setAppUserModelId('io.cheung.gmail-desktop')

let mainWindow: BrowserWindow
let replyToWindow: BrowserWindow
let isQuitting = false
let tray: Tray

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

function createWindow(): void {
  mainWindow = new BrowserWindow({
    title: app.getName(),
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: true,
      preload: joinPath(__dirname, 'preload')
    }
  })

  // Use the window state to set the mainWindow bounds
  WindowState.use('main', mainWindow)

  mainWindow.loadURL('https://mail.google.com')
  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.blur()
      mainWindow.hide()
    }
  })

  ipc.on('unread-count', (_: any, unreadCount: number) => {
    if (is.macos) {
      app.dock.setBadge(unreadCount ? unreadCount.toString() : '')
    }

    if ((is.linux || is.windows) && tray) {
      const icon = unreadCount ? 'tray-icon-unread.png' : 'tray-icon.png'
      const iconPath = joinPath(__dirname, '..', 'resources', icon)

      tray.setImage(iconPath)
    }
  })
}

function createMailto(url: string): void {
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
    const iconPath = joinPath(__dirname, '..', 'resources', 'tray-icon.png')

    const contextMenuTemplate: MenuItemConstructorOptions[] = [
      {
        role: 'quit'
      }
    ]

    if (is.linux) {
      contextMenuTemplate.unshift({
        click: () => {
          mainWindow.show()
        },
        label: 'Show'
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

  webContents.on('new-window', (event: any, url, _1, _2, options) => {
    event.preventDefault()

    if (/^(https:\/\/(mail|accounts)\.google\.com).*/.test(url)) {
      event.newGuest = new BrowserWindow(options)
    } else {
      shell.openExternal(url)
    }
  })
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
