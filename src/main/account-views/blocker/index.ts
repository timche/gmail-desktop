import { Session } from 'electron'
import { emailTrackers } from './simplify-tracker-blocklist'

const adBlocklist = ['mail-ads.google.com']

const privacyBlocklist = [
  'mail.google.com/(.*)?/logstreamz',
  'play.google.com/log'
]

const blockerRegExp = new RegExp(
  [
    ...adBlocklist,
    ...privacyBlocklist,
    ...Object.values(emailTrackers).flat()
  ].join('|'),
  'i'
)

export function initBlocker(session: Session) {
  session.webRequest.onBeforeRequest(
    {
      urls: ['<all_urls>']
    },
    ({ url }, callback) => {
      callback({ cancel: blockerRegExp.test(url) })
    }
  )
}
