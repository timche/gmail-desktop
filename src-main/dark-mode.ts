import { nativeTheme, dialog, app, ipcMain } from 'electron'
import { initOrUpdateAppMenu } from './app-menu'
import config, { ConfigKey } from './config'
import { sendChannelToAllWindows } from './utils'
import { sendToAccountViews } from './account-views'

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

  ipcMain.handle('get-dark-mode', () => {
    return nativeTheme.shouldUseDarkColors
  })

  nativeTheme.on('updated', () => {
    sendChannelToAllWindows(
      'dark-mode-updated',
      nativeTheme.shouldUseDarkColors
    )
    sendToAccountViews('dark-mode-updated', nativeTheme.shouldUseDarkColors)
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
      initOrUpdateAppMenu()
    } else if (response === 1) {
      nativeTheme.themeSource = 'light'
      config.set(ConfigKey.DarkMode, false)
      initOrUpdateAppMenu()
    } else if (response === 2) {
      nativeTheme.themeSource = 'system'
      config.set(ConfigKey.DarkMode, 'system')
      initOrUpdateAppMenu()
    }
  }
}
