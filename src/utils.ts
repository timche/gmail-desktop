import { BrowserWindow } from 'electron'

export function getMainWindow(): BrowserWindow {
  return BrowserWindow.getAllWindows()[0]
}

export function sendChannelToMainWindow(
  channel: string,
  ...args: unknown[]
): void {
  getMainWindow().webContents.send(channel, ...args)
}
