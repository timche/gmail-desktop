import { app, dialog, shell } from 'electron'
import { platform as selectPlatform } from 'electron-util'
import config, { ConfigKey } from './config'
import { cleanURLFromGoogle } from './utils'

export const platform: 'macos' | 'linux' | 'windows' = selectPlatform({
  macos: 'macos',
  linux: 'linux',
  windows: 'windows'
})

export const shouldStartMinimized = () =>
  app.commandLine.hasSwitch('launch-minimized') ||
  config.get(ConfigKey.LaunchMinimized)

export async function openExternalUrl(url: string): Promise<void> {
  const cleanURL = cleanURLFromGoogle(url)

  if (config.get(ConfigKey.ConfirmExternalLinks)) {
    const { origin } = new URL(cleanURL)
    const trustedHosts = config.get(ConfigKey.TrustedHosts)

    if (!trustedHosts.includes(origin)) {
      const { response, checkboxChecked } = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Open Link', 'Cancel'],
        message: `Do you want to open this external link in your default browser?`,
        checkboxLabel: `Trust all links on ${origin}`,
        detail: cleanURL
      })

      if (response !== 0) return

      if (checkboxChecked) {
        config.set(ConfigKey.TrustedHosts, [...trustedHosts, origin])
      }
    }
  }

  shell.openExternal(cleanURL)
}
