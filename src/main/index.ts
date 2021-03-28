import * as path from 'path'
import { app, BrowserWindow } from 'electron'
import { initUpdates } from './updates'
import config, { ConfigKey } from './config'
import { initDownloads } from './downloads'
import { initOrUpdateAppMenu } from './menus/app'
import { initTray } from './tray'
import { initOrUpdateDockMenu } from './menus/dock'
import { getSelectedAccount, initAccounts } from './accounts'
import { getMainWindow, createMainWindow } from './main-window'
import { initDarkMode, initNativeThemeSource } from './dark-mode'
import { initUserAgent } from './user-agent'
import { getSessionPartitionKey } from './account-views'
import { GMAIL_URL } from './constants'
import { handleGmail } from './gmail'

initDownloads()
initNativeThemeSource()

if (!config.get(ConfigKey.HardwareAcceleration)) {
  app.disableHardwareAcceleration()
}

app.setAppUserModelId('io.cheung.gmail-desktop')

let isQuitting = false

export function getIsQuitting() {
  return isQuitting
}

export function setIsQuitting(quit: boolean) {
  isQuitting = quit
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
        preload: path.join(__dirname, 'preload', 'account-view.js')
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

export function shouldStartMinimized() {
  return (
    app.commandLine.hasSwitch('launch-minimized') ||
    config.get(ConfigKey.LaunchMinimized)
  )
}

async function initApp() {
  await app.whenReady()

  initUserAgent()
  initDarkMode()
  createMainWindow()
  handleGmail()
  initAccounts()
  initOrUpdateAppMenu()
  initTray()
  initOrUpdateDockMenu()
  initUpdates()
}

initApp()
