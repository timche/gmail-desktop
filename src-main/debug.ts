import { is } from 'electron-util'
import config, { ConfigKey } from './config'

import electronDebug = require('electron-debug')

const OPTIONS = {
  showDevTools: true,
  isEnabled: is.development || config.get(ConfigKey.DebugMode)
}

export function init(): void {
  electronDebug(OPTIONS)
}
