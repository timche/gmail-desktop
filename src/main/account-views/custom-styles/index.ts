import { app, BrowserView } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import config, { ConfigKey } from '../../config'
import { getMainWindow } from '../../main-window'
import { getHasMultipleAccounts, sendToAccountViews } from '..'
import css from './style.css'
import macosCSS from './style.macos.css'
import { is } from 'electron-util'
import { getIsUpdateAvailable } from '../../updater'

export const userStylesPath = path.join(app.getPath('userData'), 'custom.css')

export function addCustomCSS(view: BrowserView): void {
  view.webContents.insertCSS(css)

  if (is.macos) {
    view.webContents.insertCSS(macosCSS)
  }

  if (fs.existsSync(userStylesPath)) {
    view.webContents.insertCSS(fs.readFileSync(userStylesPath, 'utf8'))
  }
}

export function setBurgerMenuOffset(view: BrowserView) {
  view.webContents.send(
    'burger-menu:set-offset',
    is.macos && !getIsUpdateAvailable() && !getHasMultipleAccounts()
  )
}

export type CustomStyleKey =
  | ConfigKey.CompactHeader
  | ConfigKey.HideFooter
  | ConfigKey.HideSupport

const keyToClassMap: Pick<Record<ConfigKey, string>, CustomStyleKey> = {
  compactHeader: 'compact-header',
  hideFooter: 'hide-footer',
  hideSupport: 'hide-support'
}

export function setCustomStyle(key: CustomStyleKey, enabled: boolean): void {
  sendToAccountViews(
    'set-custom-style',
    `gmail-desktop_${keyToClassMap[key]}`,
    enabled
  )
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
  ] as CustomStyleKey[]) {
    setCustomStyle(key, config.get(key)!)
  }

  setBurgerMenuOffset(view)
  initFullScreenStyles(view)
}
