import { app, BrowserView } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import config, { ConfigKey } from '../../config'
import { getMainWindow } from '../../main-window'
import { sendToAccountViews } from '..'
import css from './style.css'
import macosCSS from './style.macos.css'
import { is } from 'electron-util'

export const USER_CUSTOM_STYLE_PATH = path.join(
  app.getPath('userData'),
  'custom.css'
)

export function addCustomCSS(view: BrowserView): void {
  view.webContents.insertCSS(css)

  if (is.macos) {
    view.webContents.insertCSS(macosCSS)
  }

  if (fs.existsSync(USER_CUSTOM_STYLE_PATH)) {
    view.webContents.insertCSS(fs.readFileSync(USER_CUSTOM_STYLE_PATH, 'utf8'))
  }
}

export function setCustomStyle(key: ConfigKey, enabled: boolean): void {
  sendToAccountViews('set-custom-style', key, enabled)
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

export function initCustomStyles(view: BrowserView): void {
  for (const key of [
    ConfigKey.CompactHeader,
    ConfigKey.HideFooter,
    ConfigKey.HideSupport
  ])
    setCustomStyle(key, config.get(key) as boolean)

  initFullScreenStyles(view)
}
