import { app, dialog } from 'electron'
import electronDebug from 'electron-debug'
import config from './config'

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
      detail: `To ${state} debug mode, please restart ${app.getName()}`
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
  const enabled = config.get('debugMode')

  electronDebug({ ...OPTIONS, enabled })
}
