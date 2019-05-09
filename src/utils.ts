import { app, BrowserWindow, dialog } from 'electron'

export function getMainWindow(): BrowserWindow {
  return BrowserWindow.getAllWindows()[0]
}

export function sendChannelToMainWindow(
  channel: string,
  ...args: unknown[]
): void {
  getMainWindow().webContents.send(channel, ...args)
}

export function showRestartDialog(enabled: boolean, name: string): void {
  const state = enabled ? 'enable' : 'disable'

  dialog.showMessageBox(
    {
      type: 'info',
      buttons: ['Restart', 'Cancel'],
      message: 'Restart required',
      detail: `To ${state} ${name}, please restart ${app.getName()}`
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
