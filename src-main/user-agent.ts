import { app } from 'electron'
import { platform } from './helpers'
import config, { ConfigKey } from './config'
import userAgents = require('./user-agents.json')

export function removeCustomUserAgent(): void {
  config.set(ConfigKey.CustomUserAgent, '')

  app.relaunch()
  app.quit()
}

export function autoFixUserAgent(): void {
  config.set(ConfigKey.CustomUserAgent, userAgents[platform])

  app.relaunch()
  app.quit()
}
