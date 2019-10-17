import { is } from 'electron-util'

import Store = require('electron-store')

interface LastWindowState {
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
  AutoUpdate = 'autoUpdate',
  CompactHeader = 'compactHeader',
  DebugMode = 'debugMode',
  HideFooter = 'hideFooter',
  HideRightSidebar = 'hideRightSidebar',
  HideSupport = 'hideSupport',
  LastWindowState = 'lastWindowState',
  LaunchMinimized = 'launchMinimized',
  AutoHideMenuBar = 'autoHideMenuBar',
  EnableTrayIcon = 'enableTrayIcon'
}

type TypedStore = {
  [ConfigKey.AutoUpdate]: boolean
  [ConfigKey.LastWindowState]: LastWindowState
  [ConfigKey.CompactHeader]: boolean
  [ConfigKey.HideFooter]: boolean
  [ConfigKey.HideRightSidebar]: boolean
  [ConfigKey.HideSupport]: boolean
  [ConfigKey.DebugMode]: boolean
  [ConfigKey.LaunchMinimized]: boolean
  [ConfigKey.AutoHideMenuBar]: boolean
  [ConfigKey.EnableTrayIcon]: boolean
}

const defaults = {
  [ConfigKey.AutoUpdate]: true,
  [ConfigKey.LastWindowState]: {
    bounds: {
      width: 800,
      height: 600,
      x: undefined,
      y: undefined
    },
    fullscreen: false,
    maximized: true
  },
  [ConfigKey.CompactHeader]: true,
  [ConfigKey.HideFooter]: true,
  [ConfigKey.HideRightSidebar]: true,
  [ConfigKey.HideSupport]: true,
  [ConfigKey.DebugMode]: false,
  [ConfigKey.LaunchMinimized]: false,
  [ConfigKey.AutoHideMenuBar]: false,
  [ConfigKey.EnableTrayIcon]: true
}

const config = new Store<TypedStore>({
  defaults,
  name: is.development ? 'config.dev' : 'config'
})

export default config
