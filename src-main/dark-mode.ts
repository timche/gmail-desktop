import { nativeTheme, dialog, app, ipcMain } from 'electron'
import { getAppMenuItemById } from './app-menu'
import config, { ConfigKey } from './config'
import { sendChannelToAllWindows } from './utils'
import { sendToViews } from './account-views'

export async function initDarkMode() {
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

  ipcMain.handle('dark-mode', () => {
    return nativeTheme.shouldUseDarkColors
  })

  nativeTheme.on('updated', () => {
    sendChannelToAllWindows(
      'dark-mode:updated',
      nativeTheme.shouldUseDarkColors
    )
    sendToViews('dark-mode:updated', nativeTheme.shouldUseDarkColors)
  })

  if (config.get(ConfigKey.DarkMode) === undefined) {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      message: `${app.name} (now) has dark mode! Do you want to enable it?`,
      detail:
        'It\'s recommended to set the Gmail theme to "Default" in order for dark mode to work properly.',
      buttons: ['Yes', 'No', 'Follow System Appearance', 'Ask Again Later']
    })

    if (response === 0) {
      nativeTheme.themeSource = 'dark'
      config.set(ConfigKey.DarkMode, true)

      const menuItem = getAppMenuItemById('dark-mode-enabled')
      if (menuItem) {
        menuItem.checked = true
      }
    } else if (response === 1) {
      nativeTheme.themeSource = 'light'
      config.set(ConfigKey.DarkMode, false)

      const menuItem = getAppMenuItemById('dark-mode-disabled')
      if (menuItem) {
        menuItem.checked = true
      }
    } else if (response === 2) {
      nativeTheme.themeSource = 'system'
      config.set(ConfigKey.DarkMode, 'system')

      const menuItem = getAppMenuItemById('dark-mode-system')
      if (menuItem) {
        menuItem.checked = true
      }
    }
  }
}
