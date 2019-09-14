import { app } from 'electron'
import * as path from 'path'

import config, { ConfigKey } from './config'
import { sendChannelToMainWindow } from './utils'

export const USER_CUSTOM_STYLE_PATH = path.join(
  app.getPath('userData'),
  'custom.css'
)

export function setCustomStyle(key: ConfigKey, enabled: boolean): void {
  sendChannelToMainWindow('set-custom-style', key, enabled)
}

export function init(): void {
  ;[
    ConfigKey.CompactHeader,
    ConfigKey.HideFooter,
    ConfigKey.HideRightSidebar,
    ConfigKey.HideSupport
  ].forEach(key => setCustomStyle(key, config.get(key as string) as boolean))
}
