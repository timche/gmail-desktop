import * as path from 'path'
import { app, BrowserWindow } from 'electron'
import { initUpdates } from './updates'
import config, { ConfigKey } from './config'
import { initDownloads } from './downloads'
import { initOrUpdateAppMenu } from './app-menu'
import ensureOnline from './ensure-online'
import { handleUnreadCount } from './unread-counts'
import { initTray } from './tray'
import { initOrUpdateDockMenu } from './dock-menu'
import { getSelectedAccount, initAccounts } from './accounts'
import { getMainWindow, createMainWindow } from './main-window'
import { initDarkMode, initNativeThemeSource } from './dark-mode'
import { initUserAgent } from './user-agent'
import { getSessionPartitionKey } from './account-views/helpers'
import { GMAIL_URL } from './constants'

initDownloads()
initUpdates()
initNativeThemeSource()

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

  const selectedAccount = getSelectedAccount()

  if (selectedAccount) {
    const composeWindow = new BrowserWindow({
      webPreferences: {
        partition: getSessionPartitionKey(selectedAccount.id),
        preload: path.join(__dirname, 'account-views', 'preload.js')
      }
    })

    composeWindow.loadURL(`${GMAIL_URL}/mail/?extsrc=mailto&url=${url}`)
  }
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

  initUserAgent()
  initDarkMode()
  handleUnreadCount()
  createMainWindow()
  initAccounts()
  initOrUpdateAppMenu()
  initTray()
  initOrUpdateDockMenu()
})()
