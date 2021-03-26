import { nativeTheme, ipcMain } from 'electron'
import config, { ConfigKey } from './config'
import { sendChannelToAllWindows } from './utils'
import { getSelectedAccountView, sendToAccountViews } from './account-views'

export function initNativeThemeSource() {
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
}

export async function initDarkMode() {
  ipcMain.handle('init-dark-mode', (event) => {
    const selectedAccountView = getSelectedAccountView()
    return {
      enabled: nativeTheme.shouldUseDarkColors,
      initLazy: event.sender.id !== selectedAccountView?.webContents.id
    }
  })

  nativeTheme.on('updated', () => {
    sendChannelToAllWindows(
      'dark-mode-updated',
      nativeTheme.shouldUseDarkColors
    )
    sendToAccountViews('dark-mode-updated', nativeTheme.shouldUseDarkColors)
  })
}
