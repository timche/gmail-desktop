import { app } from 'electron'
import { platform as selectPlatform } from 'electron-util'
import config, { ConfigKey } from './config'

export const platform: 'macos' | 'linux' | 'windows' = selectPlatform({
  macos: 'macos',
  linux: 'linux',
  windows: 'windows'
})

export const shouldStartMinimized = () =>
  app.commandLine.hasSwitch('launch-minimized') ||
  config.get(ConfigKey.LaunchMinimized)
