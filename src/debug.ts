import electronDebug from 'electron-debug'
import config from './config'

const OPTIONS = {
  showDevTools: false
}

export function init(): void {
  const enabled = config.get('debugMode')

  electronDebug({ ...OPTIONS, enabled })
}
