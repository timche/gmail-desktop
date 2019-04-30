import path from 'path'
import fs from 'fs'
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
import utils, { is } from 'electron-util'
import log from 'electron-log'
import electronDl from 'electron-dl'
import electronContextMenu from 'electron-context-menu'

import { init as initDebug } from './debug'
import menu from './menu'
import { init as initMinimalMode } from './minimal-mode'
import WindowState from './state/window'

// Initialize the debug mode handler when starting the app
initDebug()

electronDl({ showBadge: false })
electronContextMenu({ showCopyImageAddress: true, showSaveImageAs: true })

if (!is.development) {
  log.transports.file.level = 'info'
  autoUpdater.logger = log

  const UPDATE_CHECK_INTERVAL = 60000 * 60 * 3 // 3 Hours
  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, UPDATE_CHECK_INTERVAL)

  autoUpdater.checkForUpdates()
}

app.setAppUserModelId('dev.timche.gmail-desktop')

let mainWindow: BrowserWindow
let replyToWindow: BrowserWindow
let isQuitting = false
let tray: Tray

const platform = utils.platform({
  macos: 'macos',
  linux: 'linux',
  windows: 'windows'
})

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
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: true,
      preload: path.join(__dirname, 'preload')
    }
  })

  // Use the window state to set the mainWindow bounds
  WindowState.use('main', mainWindow)

  mainWindow.loadURL('https://mail.google.com')

  mainWindow.webContents.on('dom-ready', () => {
    addCustomCSS(mainWindow)

    // Initialize minimal mode if the setting is turned on
    initMinimalMode()
  })

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
      const iconPath = path.join(__dirname, '..', 'static', icon)

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

function addCustomCSS(windowElement: BrowserWindow): void {
  windowElement.webContents.insertCSS(
    fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8')
  )

  const platformCSSFile = path.join(
    __dirname,
    '..',
    'css',
    `style.${platform}.css`
  )
  if (fs.existsSync(platformCSSFile)) {
    windowElement.webContents.insertCSS(
      fs.readFileSync(platformCSSFile, 'utf8')
    )
  }
}

app.on('ready', () => {
  createWindow()

  Menu.setApplicationMenu(menu)

  if ((is.linux || is.windows) && !tray) {
    const appName = app.getName()
    const iconPath = path.join(__dirname, '..', 'static', 'tray-icon.png')

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
      // Center the new window on the screen
      event.newGuest = new BrowserWindow({
        ...options,
        x: null,
        y: null
      })

      event.newGuest.webContents.on('dom-ready', () => {
        addCustomCSS(event.newGuest)
      })

      event.newGuest.webContents.on(
        'new-window',
        (event: Event, url: string) => {
          event.preventDefault()
          shell.openExternal(url)
        }
      )
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
