import config, { ConfigKey } from './config'

import electronDebug = require('electron-debug')

const OPTIONS = {
  showDevTools: false
}

export function init(): void {
  electronDebug({ ...OPTIONS, isEnabled: config.get(ConfigKey.DebugMode) })
}
