import { app } from 'electron'
import { initUpdates } from './updates'
import config, { ConfigKey } from './config'
import { initDownloads } from './downloads'
import { initOrUpdateAppMenu } from './menus/app'
import { initTray } from './tray'
import { initOrUpdateDockMenu } from './menus/dock'
import { initAccounts } from './accounts'
import { getMainWindow, createMainWindow } from './main-window'
import { initDarkMode, initNativeThemeSource } from './dark-mode'
import { initUserAgent } from './user-agent'
import { sendToSelectedAccountView } from './account-views'
import { handleGmail } from './gmail'
import { initOrUpdateTrayMenu } from './menus/tray'

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

app.on('open-url', (_event, mailto) => {
  sendToSelectedAccountView('gmail:compose-mail', mailto.split(':')[1])
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
  initOrUpdateTrayMenu()
  initOrUpdateDockMenu()
  initUpdates()
}

initApp()
