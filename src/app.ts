import * as fs from 'fs'
import * as path from 'path'
import {
  app,
  ipcMain as ipc,
  shell,
  BrowserWindow,
  Menu,
  Tray,
  MenuItemConstructorOptions,
  dialog,
  nativeTheme
} from 'electron'
import { is } from 'electron-util'

import { init as initAutoUpdates } from './updates'
import config, { ConfigKey } from './config'
import {
  init as initCustomStyles,
  USER_CUSTOM_STYLE_PATH
} from './custom-styles'
import { init as initDebug } from './debug'
import { init as initDownloads } from './downloads'
import { platform, getUrlAccountId, createTrayIcon } from './helpers'
import menu from './menu'
import {
  setAppMenuBarVisibility,
  cleanURLFromGoogle,
  sendChannelToAllWindows
} from './utils'
import ensureOnline from './ensure-online'
import { getCustomUserAgent, autoFixUserAgent } from './user-agent'

import electronContextMenu = require('electron-context-menu')

initDebug()
initDownloads()
initAutoUpdates()

electronContextMenu({ showCopyImageAddress: true, showSaveImageAs: true })

if (!config.get(ConfigKey.HardwareAcceleration)) {
  app.disableHardwareAcceleration()
}

const shouldStartMinimized =
  app.commandLine.hasSwitch('launch-minimized') ||
  config.get(ConfigKey.LaunchMinimized)

const trayIcon = createTrayIcon(false)
const trayIconUnread = createTrayIcon(true)

app.setAppUserModelId('io.cheung.gmail-desktop')

let mainWindow: BrowserWindow
let replyToWindow: BrowserWindow
let isQuitting = false
let tray: Tray | undefined
let trayContextMenu: Menu

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

switch (config.get(ConfigKey.DarkMode)) {
  case 'system':
    nativeTheme.themeSource = 'system'
    break
  case true:
    nativeTheme.themeSource = 'dark'
    break
  default:
    nativeTheme.themeSource = 'light'
}

function createWindow(): void {
  const lastWindowState = config.get(ConfigKey.LastWindowState)

  mainWindow = new BrowserWindow({
    title: app.name,
    titleBarStyle: config.get(ConfigKey.CompactHeader)
      ? 'hiddenInset'
      : 'default',
    width: lastWindowState.bounds.width,
    height: lastWindowState.bounds.height,
    x: lastWindowState.bounds.x,
    y: lastWindowState.bounds.y,
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: true,
      preload: path.join(__dirname, 'preload')
    },
    show: !shouldStartMinimized
  })

  if (lastWindowState.fullscreen && !mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(lastWindowState.fullscreen)
  }

  if (lastWindowState.maximized && !mainWindow.isMaximized()) {
    mainWindow.maximize()
  }

  if (is.linux || is.windows) {
    setAppMenuBarVisibility()
  }

  mainWindow.loadURL('https://mail.google.com')

  mainWindow.on('app-command', (_event, command) => {
    if (command === 'browser-backward' && mainWindow.webContents.canGoBack()) {
      mainWindow.webContents.goBack()
    } else if (
      command === 'browser-forward' &&
      mainWindow.webContents.canGoForward()
    ) {
      mainWindow.webContents.goForward()
    }
  })

  mainWindow.webContents.on('dom-ready', () => {
    addCustomCSS(mainWindow)
    initCustomStyles()
  })

  mainWindow.webContents.on('did-finish-load', async () => {
    if (mainWindow.webContents.getURL().includes('signin/rejected')) {
      const { response } = await dialog.showMessageBox({
        type: 'info',
        message: `It looks like you are unable to sign-in, because ${app.name} is using a non-supported user agent and Gmail is blocking it.`,
        detail: `Do you want ${app.name} try to fix it automatically? Otherwise you can set your own user agent (see "Troubleshoot").`,
        buttons: ['Yes', 'No', 'Troubleshoot']
      })

      if (response === 2) {
        openExternalUrl(
          'https://github.com/timche/gmail-desktop#i-cant-sign-in-this-browser-or-app-may-not-be-secure'
        )
        return
      }

      if (response === 1) {
        return
      }

      autoFixUserAgent()
    }
  })

  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.blur()
      mainWindow.hide()
    }
  })

  mainWindow.on('hide', () => toggleAppVisiblityTrayItem(false))

  mainWindow.on('show', () => toggleAppVisiblityTrayItem(true))

  function toggleAppVisiblityTrayItem(isMainWindowVisible: boolean): void {
    if (config.get(ConfigKey.EnableTrayIcon) && tray) {
      trayContextMenu.getMenuItemById('show-win').visible = !isMainWindowVisible
      trayContextMenu.getMenuItemById('hide-win').visible = isMainWindowVisible
      tray.setContextMenu(trayContextMenu)
    }
  }

  ipc.on('unread-count', (_: Event, unreadCount: number) => {
    if (is.macos) {
      app.dock.setBadge(unreadCount ? unreadCount.toString() : '')
    }

    if (tray) {
      tray.setImage(unreadCount ? trayIconUnread : trayIcon)
      if (is.macos) {
        tray.setTitle(unreadCount ? unreadCount.toString() : '')
      }
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

  if (fs.existsSync(USER_CUSTOM_STYLE_PATH)) {
    windowElement.webContents.insertCSS(
      fs.readFileSync(USER_CUSTOM_STYLE_PATH, 'utf8')
    )
  }

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

async function openExternalUrl(url: string): Promise<void> {
  const cleanURL = cleanURLFromGoogle(url)

  if (config.get(ConfigKey.ConfirmExternalLinks)) {
    const { origin } = new URL(cleanURL)
    const trustedHosts = config.get(ConfigKey.TrustedHosts)

    if (!trustedHosts.includes(origin)) {
      const { response, checkboxChecked } = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Open Link', 'Cancel'],
        message: `Do you want to open the external link "${cleanURL}" in your default browser?`,
        checkboxLabel: `Trust all links on ${origin}`,
        detail: cleanURL
      })

      if (response !== 0) return

      if (checkboxChecked) {
        config.set(ConfigKey.TrustedHosts, [...trustedHosts, origin])
      }
    }
  }

  shell.openExternal(cleanURL)
}

app.on('open-url', (event, url) => {
  event.preventDefault()
  createMailto(url)
})

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
  }
})

app.on('before-quit', () => {
  isQuitting = true

  if (mainWindow) {
    config.set(ConfigKey.LastWindowState, {
      bounds: mainWindow.getBounds(),
      fullscreen: mainWindow.isFullScreen(),
      maximized: mainWindow.isMaximized()
    })
  }
})
;(async () => {
  await Promise.all([ensureOnline(), app.whenReady()])

  const userAgent = await getCustomUserAgent()

  if (userAgent) {
    app.userAgentFallback = userAgent
  }

  ipc.handle('dark-mode', () => {
    return nativeTheme.shouldUseDarkColors
  })

  nativeTheme.on('updated', () => {
    sendChannelToAllWindows(
      'dark-mode:updated',
      nativeTheme.shouldUseDarkColors
    )
  })

  createWindow()

  Menu.setApplicationMenu(menu)

  if (config.get(ConfigKey.EnableTrayIcon) && !tray) {
    const appName = app.name

    const contextMenuTemplate: MenuItemConstructorOptions[] = [
      {
        click: () => {
          mainWindow.show()
        },
        label: 'Show',
        visible: shouldStartMinimized,
        id: 'show-win'
      },
      {
        label: 'Hide',
        visible: !shouldStartMinimized,
        click: () => {
          mainWindow.hide()
        },
        id: 'hide-win'
      },
      {
        role: 'quit'
      }
    ]

    trayContextMenu = Menu.buildFromTemplate(contextMenuTemplate)

    tray = new Tray(trayIcon)
    tray.setToolTip(appName)
    tray.setContextMenu(trayContextMenu)
    tray.on('click', () => {
      if (mainWindow) {
        mainWindow.show()
      }
    })
  }

  const { webContents } = mainWindow!

  webContents.on('dom-ready', () => {
    if (!shouldStartMinimized) {
      mainWindow.show()
    }
  })

  // eslint-disable-next-line max-params
  webContents.on('new-window', (event: any, url, _1, _2, options) => {
    event.preventDefault()

    // `Add account` opens `accounts.google.com`
    if (url.startsWith('https://accounts.google.com')) {
      mainWindow.loadURL(url)
      return
    }

    if (url.startsWith('https://mail.google.com')) {
      // Check if the user switches accounts which is determined
      // by the URL: `mail.google.com/mail/u/<local_account_id>/...`
      const currentAccountId = getUrlAccountId(mainWindow.webContents.getURL())
      const targetAccountId = getUrlAccountId(url)

      if (targetAccountId !== currentAccountId) {
        mainWindow.loadURL(url)
        return
      }

      // Center the new window on the screen
      event.newGuest = new BrowserWindow({
        ...options,
        titleBarStyle: 'default',
        x: undefined,
        y: undefined
      })

      event.newGuest.webContents.on('dom-ready', () => {
        addCustomCSS(event.newGuest)
      })

      event.newGuest.webContents.on(
        'new-window',
        (event: Event, url: string) => {
          event.preventDefault()
          openExternalUrl(url)
        }
      )

      return
    }

    if (url.startsWith('about:blank')) {
      const win = new BrowserWindow({
        ...options,
        show: false
      })

      win.webContents.once('will-redirect', (_event, url) => {
        openExternalUrl(url)
        win.destroy()
      })

      event.newGuest = win

      return
    }

    openExternalUrl(url)
  })
})()
