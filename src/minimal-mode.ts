import appConfig from 'electron-settings'

import { sendAction } from './utils'

export const CONFIG_KEY = 'minimal-mode'

export function setMinimalMode(enabled: boolean): void {
  sendAction('set-minimal-mode', enabled)
}

export function init(): void {
  setMinimalMode(Boolean(appConfig.get(CONFIG_KEY, false)))
}
