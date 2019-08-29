import Store from 'electron-store'
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

export enum ConfigKey {
  CompactHeader = 'compactHeader',
  DebugMode = 'debugMode',
  HideFooter = 'hideFooter',
  HideRightSidebar = 'hideRightSidebar',
  HideSupport = 'hideSupport',
  LastWindowState = 'lastWindowState'
}

const defaults = {
  [ConfigKey.LastWindowState]: ({
    bounds: {
      width: 800,
      height: 600,
      x: undefined as number | undefined,
      y: undefined as number | undefined
    },
    fullscreen: false,
    maximized: true
  } as unknown) as LastWindowState,
  [ConfigKey.CompactHeader]: true,
  [ConfigKey.HideFooter]: true,
  [ConfigKey.HideRightSidebar]: true,
  [ConfigKey.HideSupport]: true,
  [ConfigKey.DebugMode]: false
}

const config = new Store({
  defaults,
  name: is.development ? 'config.dev' : 'config'
})

export default config
