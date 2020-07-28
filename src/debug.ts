import config, { ConfigKey } from './config'

import electronDebug = require('electron-debug')

const OPTIONS = {
  showDevTools: false,
  isEnabled: config.get(ConfigKey.DebugMode)
}

export function init(): void {
  electronDebug(OPTIONS)
}
