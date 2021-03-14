import { app, BrowserWindow, dialog } from 'electron'
import config, { ConfigKey } from './config'

export function getMainWindow(): BrowserWindow | undefined {
  return BrowserWindow.getAllWindows()[0]
}

export function setAppMenuBarVisibility(showTip?: boolean): void {
  const mainWindow = getMainWindow()

  if (mainWindow) {
    const isAppMenuBarVisible = config.get(ConfigKey.AutoHideMenuBar)
    mainWindow.setMenuBarVisibility(!isAppMenuBarVisible)
    mainWindow.autoHideMenuBar = isAppMenuBarVisible

    if (isAppMenuBarVisible && showTip) {
      dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        message: 'Tip: You can press the Alt key to see the Menu bar again.'
      })
    }
  }
}

export function sendChannelToMainWindow(
  channel: string,
  ...args: unknown[]
): void {
  const mainWindow = getMainWindow()

  if (mainWindow) {
    mainWindow.webContents.send(channel, ...args)
  }
}

export function sendChannelToAllWindows(
  channel: string,
  ...args: unknown[]
): void {
  const windows = BrowserWindow.getAllWindows()

  for (const window of windows) {
    window.webContents.send(channel, ...args)
  }
}

export async function showRestartDialog(
  enabled?: boolean,
  name?: string
): Promise<void> {
  const state = enabled ? 'enable' : 'disable'

  const { response } = await dialog.showMessageBox({
    type: 'info',
    buttons: ['Restart', 'Cancel'],
    message: 'Restart required',
    detail:
      typeof enabled === 'boolean' && name
        ? `To ${state} ${name}, please restart ${app.name}`
        : 'A restart is required to apply the settings'
  })

  // If restart was clicked (index of 0), restart the app
  if (response === 0) {
    app.relaunch()
    app.quit()
  }
}

export function cleanURLFromGoogle(url: string): string {
  if (!url.includes('google.com/url')) {
    return url
  }

  return new URL(url).searchParams.get('q') ?? url
}
