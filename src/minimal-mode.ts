import appConfig from 'electron-settings'

import { sendChannelToMainWindow } from './utils'

export const CONFIG_KEY = 'minimal-mode'

export function setMinimalMode(enabled: boolean): void {
  sendChannelToMainWindow('set-minimal-mode', enabled)
}

export function init(): void {
  setMinimalMode(Boolean(appConfig.get(CONFIG_KEY, false)))
}
