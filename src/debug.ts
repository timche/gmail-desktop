import config, { ConfigKey } from './config'

import electronDebug = require('electron-debug')

const OPTIONS = {
  showDevTools: false
}

export function init(): void {
  const isEnabled = config.get(ConfigKey.DebugMode) as boolean
  electronDebug({ ...OPTIONS, isEnabled })
}
