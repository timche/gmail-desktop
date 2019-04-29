import electronUtils from 'electron-util'

// URL: `mail.google.com/mail/u/<local_account_id>`
export function getUrlAccountId(url: string): null | string {
  const accountIdRegExp = /mail\/u\/(\d+)\//
  const res = accountIdRegExp.exec(url)
  return res && res[1]
}

export const platform = electronUtils.platform({
  macos: 'macos',
  linux: 'linux',
  windows: 'windows'
})
