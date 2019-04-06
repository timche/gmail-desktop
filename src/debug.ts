import { app, dialog } from 'electron'
import { is } from 'electron-util'
import appConfig from 'electron-settings'
import electronDebug from 'electron-debug'

export const CONFIG_KEY = 'debug-mode'
const OPTIONS = {
  showDevTools: false
}

export function showRestartDialog(enabled: boolean): void {
  const state = enabled ? 'enable' : 'disable'

  dialog.showMessageBox(
    {
      type: 'info',
      buttons: ['Restart', 'Cancel'],
      message: 'Restart required',
      detail: `To ${state} debug mode, please restart Gmail Desktop`
    },
    response => {
      // If restart was clicked (index of 0), restart the app
      if (response === 0) {
        app.relaunch()
        app.quit()
      }
    }
  )
}

export function init(): void {
  const enabled = Boolean(appConfig.get(CONFIG_KEY, is.development))

  electronDebug({ ...OPTIONS, enabled })
}
