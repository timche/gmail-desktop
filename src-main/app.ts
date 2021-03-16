import { app, BrowserWindow } from 'electron'
import { init as initAutoUpdates } from './updates'
import config, { ConfigKey } from './config'
import { init as initDebug } from './debug'
import { init as initDownloads } from './downloads'
import { initOrUpdateAppMenu } from './app-menu'
import ensureOnline from './ensure-online'
import electronContextMenu = require('electron-context-menu')
import { handleUnreadCount } from './unread-counts'
import { initTray } from './tray'
import { initDock } from './dock'
import { initAccounts } from './accounts'
import { getMainWindow, createMainWindow } from './main-window'
import { initDarkMode } from './dark-mode'

initDebug()
initDownloads()
initAutoUpdates()

electronContextMenu({ showCopyImageAddress: true, showSaveImageAs: true })

if (!config.get(ConfigKey.HardwareAcceleration)) {
  app.disableHardwareAcceleration()
}

app.setAppUserModelId('io.cheung.gmail-desktop')

let isQuitting = false

export function getIsQuitting() {
  return isQuitting
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('second-instance', () => {
  const mainWindow = getMainWindow()
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.show()
  }
})

app.on('open-url', (event, url) => {
  event.preventDefault()

  // @TODO: Open in view
  const mainWindow = getMainWindow()
  const replyToWindow = new BrowserWindow({
    parent: mainWindow
  })

  replyToWindow.loadURL(
    `https://mail.google.com/mail/?extsrc=mailto&url=${url}`
  )
})

app.on('activate', () => {
  const mainWindow = getMainWindow()
  if (mainWindow) {
    mainWindow.show()
  }
})

app.on('before-quit', () => {
  isQuitting = true

  const mainWindow = getMainWindow()
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

  const customUserAgent = config.get(ConfigKey.CustomUserAgent)

  if (customUserAgent) {
    app.userAgentFallback = customUserAgent
  }

  initDarkMode()
  handleUnreadCount()
  initOrUpdateAppMenu()
  initTray()
  initDock()
  createMainWindow()
  initAccounts()
})()
