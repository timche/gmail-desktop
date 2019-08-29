import electronDebug from 'electron-debug'
import config, { ConfigKey } from './config'

const OPTIONS = {
  showDevTools: false
}

export function init(): void {
  const enabled = config.get(ConfigKey.DebugMode)

  electronDebug({ ...OPTIONS, enabled })
}
