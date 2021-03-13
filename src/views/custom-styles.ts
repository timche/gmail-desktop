import { app, BrowserView } from 'electron'
import * as path from 'path'

import config, { ConfigKey } from '../config'
import { getMainWindow } from '../utils'
import { sendToViews } from '.'

export const USER_CUSTOM_STYLE_PATH = path.join(
  app.getPath('userData'),
  'custom.css'
)

export function setCustomStyle(key: ConfigKey, enabled: boolean): void {
  sendToViews('set-custom-style', key, enabled)
}

function initFullScreenStyles(view: BrowserView): void {
  const mainWindow = getMainWindow()

  if (mainWindow) {
    mainWindow.on('enter-full-screen', () => {
      view.webContents.send('set-full-screen', true)
    })

    mainWindow.on('leave-full-screen', () => {
      view.webContents.send('set-full-screen', false)
    })
  }
}

export function init(view: BrowserView): void {
  for (const key of [
    ConfigKey.CompactHeader,
    ConfigKey.HideFooter,
    ConfigKey.HideSupport
  ])
    setCustomStyle(key, config.get(key) as boolean)

  initFullScreenStyles(view)
}
