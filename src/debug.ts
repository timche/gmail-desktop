import config, { ConfigKey } from './config'

import electronDebug = require('electron-debug')

const OPTIONS = {
  showDevTools: true,
  isEnabled: config.get(ConfigKey.DebugMode)
}

export function init(): void {
  electronDebug(OPTIONS)
}
