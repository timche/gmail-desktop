import { app, dialog } from 'electron'

export async function showRestartDialog() {
  const { response } = await dialog.showMessageBox({
    type: 'info',
    buttons: ['Restart', 'Cancel'],
    message: 'Restart required',
    detail: 'A restart is required to apply the settings'
  })

  if (response === 0) {
    app.relaunch()
    app.quit()
  }
}
