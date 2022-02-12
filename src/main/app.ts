import { app } from 'electron'
import config, { ConfigKey } from './config'
import { getMainWindow } from './main-window'
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

    const mainWindow = getMainWindow()

    if (mainWindow) {
      mainWindow.show()
    }
  })

  app.on('activate', () => {
    const mainWindow = getMainWindow()

    if (mainWindow) {
      mainWindow.show()
    }
  })

  app.on('before-quit', () => {
    setIsQuittingApp(true)

    const mainWindow = getMainWindow()

    if (mainWindow) {
      config.set(ConfigKey.LastWindowState, {
        bounds: mainWindow.getBounds(),
        fullscreen: mainWindow.isFullScreen(),
        maximized: mainWindow.isMaximized()
      })
    }
  })

  await app.whenReady()

  return true
}
