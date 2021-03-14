import { app } from 'electron'
import config, { ConfigKey } from './config'

export const shouldStartMinimized =
  app.commandLine.hasSwitch('launch-minimized') ||
  config.get(ConfigKey.LaunchMinimized)
