import { Session } from 'electron'
import config, { ConfigKey } from '../../config'
import { emailTrackers } from './simplify-tracker-blocklist'

const adBlocklist = ['mail-ads.google.com']

const analyticsBlocklist = [
  'mail.google.com/(.*)?/logstreamz',
  'play.google.com/log'
]

const blockerRegExp = new RegExp(
  [
    ...(config.get(ConfigKey.BlockerBlockAds) ? adBlocklist : []),
    ...(config.get(ConfigKey.BlockerBlockAnalytics) ? analyticsBlocklist : []),
    ...(config.get(ConfigKey.BlockerBlockEmailTrackers)
      ? Object.values(emailTrackers).flat()
      : [])
  ].join('|'),
  'i'
)

export function initBlocker(session: Session) {
  if (config.get(ConfigKey.BlockerEnabled)) {
    session.webRequest.onBeforeRequest(
      {
        urls: ['<all_urls>']
      },
      ({ url }, callback) => {
        callback({ cancel: blockerRegExp.test(url) })
      }
    )
  }
}
