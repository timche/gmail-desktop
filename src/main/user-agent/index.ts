import { app } from 'electron'
import { platform } from '../helpers'
import config, { ConfigKey } from '../config'
import userAgents from './user-agents.json'
import { showRestartDialog } from '../utils'

export function removeCustomUserAgent(): void {
  config.set(ConfigKey.CustomUserAgent, '')

  app.relaunch()
  app.quit()
}

export async function enableAutoFixUserAgent({
  enable = true
}: {
  enable?: boolean
  showRestartDialog?: boolean
} = {}) {
  config.set(ConfigKey.AutoFixUserAgent, enable)
  showRestartDialog()
}

export function getPlatformUserAgentFix() {
  return userAgents[platform]
}

export function initUserAgent() {
  const autoFixUserAgent = config.get(ConfigKey.AutoFixUserAgent)

  if (autoFixUserAgent) {
    app.userAgentFallback = getPlatformUserAgentFix()
    return
  }

  const customUserAgent = config.get(ConfigKey.CustomUserAgent)

  if (customUserAgent) {
    app.userAgentFallback = customUserAgent
  }
}
