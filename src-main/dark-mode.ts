import { nativeTheme, ipcMain } from 'electron'
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
}
