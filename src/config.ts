import fs from 'fs'
import Store from 'electron-store'
import oldConfig from 'electron-settings'
import { is } from 'electron-util'

export interface LastWindowState {
  bounds: {
    width: number
    height: number
    x: number | undefined
    y: number | undefined
  }
  fullscreen: boolean
  maximized: boolean
}

const defaults = {
  lastWindowState: ({
    bounds: {
      width: 800,
      height: 600,
      x: undefined as number | undefined,
      y: undefined as number | undefined
    },
    fullscreen: false,
    maximized: true
  } as unknown) as LastWindowState,
  minimalMode: false,
  debugMode: false,
  customStyles: true
}

const config = new Store({
  defaults,
  name: is.development ? 'config.dev' : 'config'
})

// @TODO: Remove `electron-settings` in future version
function migrate(): void {
  const oldConfigFile = oldConfig.file()

  if (!fs.existsSync(oldConfigFile)) {
    return
  }

  if (oldConfig.has('debug-mode')) {
    const debugMode = (oldConfig.get('debug-mode') as unknown) as boolean
    config.set('debugMode', debugMode)
  }

  if (oldConfig.has('minimal-mode')) {
    const minimalMode = (oldConfig.get('minimal-mode') as unknown) as boolean
    config.set('minimalMode', minimalMode)
  }

  fs.unlinkSync(oldConfigFile)
}

migrate()

export default config
