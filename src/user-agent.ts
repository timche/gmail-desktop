import { app } from 'electron'
import got from 'got'
import { platform } from 'electron-util'
import config, { ConfigKey } from './config'

export function resetUserAgent(): void {
  config.delete(ConfigKey.OverrideUserAgent)

  app.relaunch()
  app.quit()
}

export function autoFixUserAgent(): void {
  config.delete(ConfigKey.OverrideUserAgent)
  config.set(ConfigKey.AutoFixUserAgent, true)

  app.relaunch()
  app.quit()
}

export async function getCustomUserAgent(): Promise<string | null> {
  const overrideUserAgent = config.get(ConfigKey.OverrideUserAgent)

  if (overrideUserAgent) {
    return overrideUserAgent
  }

  if (config.get(ConfigKey.AutoFixUserAgent)) {
    try {
      const { body } = await got(
        'https://www.whatismybrowser.com/guides/the-latest-user-agent/firefox'
      )
      const match = body.match(
        /Mozilla\/\d+.\d+ \(.+\) Gecko\/\d+ Firefox\/\d+.\d+/gm
      )

      if (match) {
        const userAgent: string = platform({
          windows: match[0],
          macos: match[1],
          linux: match[5]
        })

        config.set(ConfigKey.OverrideUserAgent, userAgent)
        config.set(ConfigKey.AutoFixUserAgent, false)

        return userAgent
      }
    } catch (error) {} // eslint-disable-line @typescript-eslint/no-unused-vars
  }

  return null
}
