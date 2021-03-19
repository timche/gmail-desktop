import { platform as selectPlatform } from 'electron-util'

export const platform: 'macos' | 'linux' | 'windows' = selectPlatform({
  macos: 'macos',
  linux: 'linux',
  windows: 'windows'
})
