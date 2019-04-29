import config from './config'

import { sendChannelToMainWindow } from './utils'

export function setMinimalMode(enabled: boolean): void {
  sendChannelToMainWindow('set-minimal-mode', enabled)
}

export function init(): void {
  setMinimalMode(config.get('minimalMode'))
}
