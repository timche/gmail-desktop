import { app, dialog } from 'electron'
import { platform } from './helpers'
import config, { ConfigKey } from './config'
import userAgents = require('./user-agents.json')

export function removeCustomUserAgent(): void {
  config.set(ConfigKey.CustomUserAgent, '')

  app.relaunch()
  app.quit()
}

export async function enableAutoFixUserAgent({
  enable = true,
  showRestartDialog
}: {
  enable?: boolean
  showRestartDialog?: boolean
} = {}) {
  config.set(ConfigKey.AutoFixUserAgent, enable)

  if (showRestartDialog) {
    const { response } = await dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart', 'Cancel'],
      message: 'Restart required',
      detail: 'A restart is required to apply the settings'
    })

    if (response === 1) {
      return
    }
  }

  app.relaunch()
  app.quit()
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
