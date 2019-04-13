import { BrowserWindow } from 'electron'

export function getWindow(): BrowserWindow {
  return BrowserWindow.getAllWindows()[0]
}

export function sendAction(action: string, ...args: unknown[]): void {
  getWindow().webContents.send(action, ...args)
}
