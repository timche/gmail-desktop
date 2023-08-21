import { app } from 'electron'
import config, { ConfigKey } from './config'
import { getMainWindow, showMainWindow } from './main-window'
import { sendToSelectedAccountView } from './account-views'
import { appId } from '../constants'

let isQuittingApp = false

export function getIsQuittingApp() {
  return isQuittingApp
}

export function setIsQuittingApp(quit: boolean) {
  isQuittingApp = quit
}

export function shouldLaunchMinimized() {
  return (
    app.commandLine.hasSwitch('launch-minimized') ||
    config.get(ConfigKey.LaunchMinimized) ||
    app.getLoginItemSettings().wasOpenedAsHidden
  )
}

export async function initApp() {
  app.setAppUserModelId(appId)

  if (!app.requestSingleInstanceLock()) {
    app.quit()

    return false
  }

  if (!config.get(ConfigKey.HardwareAcceleration)) {
    app.disableHardwareAcceleration()
  }

  app.on('second-instance', (_event, argv, _workingDirectory) => {
    const mailtoString = argv.find((s) => s.startsWith('mailto:'))

    if (mailtoString) {
      sendToSelectedAccountView('gmail:compose-mail', mailtoString)
    }

    showMainWindow()
  })

  app.on('open-url', (_event, mailto) => {
    sendToSelectedAccountView('gmail:compose-mail', mailto)

    showMainWindow()
  })

  app.on('activate', () => {
    showMainWindow()
  })

  app.on('before-quit', () => {
    setIsQuittingApp(true)

    const mainWindow = getMainWindow()

    config.set(ConfigKey.LastWindowState, {
      bounds: mainWindow.getBounds(),
      fullscreen: mainWindow.isFullScreen(),
      maximized: mainWindow.isMaximized()
    })
  })

  await app.whenReady()

  return true
}
