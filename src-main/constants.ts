import { app } from 'electron'
import config, { ConfigKey } from './config'

export const SHOULD_START_MINIMIZED =
  app.commandLine.hasSwitch('launch-minimized') ||
  config.get(ConfigKey.LaunchMinimized)

export const ACCOUNTS_TAB_HEIGHT = 40

export const GMAIL_URL = 'https://mail.google.com'
