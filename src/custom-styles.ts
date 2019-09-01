import config, { ConfigKey } from './config'

import { sendChannelToMainWindow } from './utils'

export function setCustomStyle(key: ConfigKey, enabled: boolean): void {
  sendChannelToMainWindow('set-custom-style', key, enabled)
}

export function init(): void {
  ;[
    ConfigKey.CompactHeader,
    ConfigKey.HideFooter,
    ConfigKey.HideRightSidebar,
    ConfigKey.HideSupport
  ].forEach(key => setCustomStyle(key, config.get(key as string) as boolean))
}
