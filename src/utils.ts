import { app, BrowserWindow, dialog } from 'electron'
import config, { ConfigKey } from './config'

export function getMainWindow(): BrowserWindow {
  return BrowserWindow.getAllWindows()[0]
}

export function setAppMenuBarVisibility(): void {
  const mainWindow = getMainWindow()
  const isAppMenuBarVisible = config.get(ConfigKey.AutoHideMenuBar)
  mainWindow.setMenuBarVisibility(!isAppMenuBarVisible)
  mainWindow.setAutoHideMenuBar(isAppMenuBarVisible)

  if (isAppMenuBarVisible) {
    dialog.showMessageBox({
      type: 'info',
      buttons: ['OK'],
      message: 'Tip: You can press the Alt key to see the Menu bar again.'
    })
  }
}

export function sendChannelToMainWindow(
  channel: string,
  ...args: unknown[]
): void {
  getMainWindow().webContents.send(channel, ...args)
}

export async function showRestartDialog(
  enabled: boolean,
  name: string
): Promise<void> {
  const state = enabled ? 'enable' : 'disable'

  const { response } = await dialog.showMessageBox({
    type: 'info',
    buttons: ['Restart', 'Cancel'],
    message: 'Restart required',
    detail: `To ${state} ${name}, please restart ${app.getName()}`
  })

  // If restart was clicked (index of 0), restart the app
  if (response === 0) {
    app.relaunch()
    app.quit()
  }
}
