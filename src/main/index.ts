import { initUpdater } from './updater'
import { initDownloads } from './downloads'
import { initOrUpdateAppMenu } from './menus/app'
import { initTray } from './tray'
import { initOrUpdateDockMenu } from './menus/dock'
import { initAccounts } from './accounts'
import { createMainWindow } from './main-window'
import { initDarkMode } from './dark-mode'
import { initUserAgent } from './user-agent'
import { handleGmail } from './gmail'
import { initOrUpdateTrayMenu } from './menus/tray'
import { initApp } from './app'

async function initMain() {
  initDownloads()

  const isAppInitialized = await initApp()

  if (!isAppInitialized) {
    return
  }

  initUserAgent()
  initDarkMode()
  createMainWindow()
  handleGmail()
  initAccounts()
  initOrUpdateAppMenu()
  initTray()
  initOrUpdateTrayMenu()
  initOrUpdateDockMenu()
  initUpdater()
}

initMain()
