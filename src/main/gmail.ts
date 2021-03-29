import { app, ipcMain, Notification } from 'electron'
import { getAccountIdByViewId } from './account-views'
import { getAccount, selectAccount } from './accounts'
import { getMainWindow, sendToMainWindow } from './main-window'
import config, { ConfigKey } from './config'
import { is } from 'electron-util'
import { updateTrayUnreadStatus } from './tray'
import { Mail, UnreadCounts } from '../types'

const unreadCounts: UnreadCounts = {}

export function getTotalUnreadCount() {
  let totalUnreadCount = 0

  for (const unreadCount of Object.values(unreadCounts)) {
    totalUnreadCount += unreadCount
  }

  return totalUnreadCount
}

export function newMailNotification(
  { messageId, sender, subject, summary }: Mail,
  accountViewWebContents: Electron.WebContents
) {
  const accountId = getAccountIdByViewId(accountViewWebContents.id)

  if (!accountId) {
    return
  }

  const account = getAccount(accountId)

  if (!account) {
    return
  }

  const notification = new Notification({
    title: config.get(ConfigKey.NotificationsShowSender)
      ? sender.name
      : account.label,
    subtitle: config.get(ConfigKey.NotificationsShowSubject)
      ? subject
      : undefined,
    body: config.get(ConfigKey.NotificationsShowSummary) ? summary : undefined,
    silent: !config.get(ConfigKey.NotificationsPlaySound),
    actions: [
      {
        text: 'Archive',
        type: 'button'
      },
      {
        text: 'Mark As Read',
        type: 'button'
      },
      {
        text: 'Delete',
        type: 'button'
      },
      {
        text: 'Mark As Spam',
        type: 'button'
      }
    ]
  })

  notification.on('action', (_event, index) => {
    switch (index) {
      case 1:
        accountViewWebContents.send('gmail:mark-mail-as-read', messageId)
        break
      case 2:
        accountViewWebContents.send('gmail:delete-mail', messageId)
        break
      case 3:
        accountViewWebContents.send('gmail:mark-mail-as-spam', messageId)
        break
      default:
        accountViewWebContents.send('gmail:archive-mail', messageId)
    }

    clearTimeout(closeTimeout)
  })

  notification.on('click', () => {
    accountViewWebContents.send('gmail:open-mail', messageId)
    selectAccount(account.id)
    getMainWindow().show()
    clearTimeout(closeTimeout)
  })

  notification.show()

  let closeTimeout: ReturnType<typeof setTimeout>

  if (config.get(ConfigKey.NotificationsAutoClose)) {
    closeTimeout = setTimeout(() => {
      notification.close()
    }, 5000) // MacOS default is 5 seconds
  }
}

export function handleGmail() {
  ipcMain.on('gmail:unread-count', ({ sender }, unreadCount: number) => {
    const accountId = getAccountIdByViewId(sender.id)
    if (accountId) {
      unreadCounts[accountId] = unreadCount

      const totalUnreadCount = getTotalUnreadCount()

      if (is.macos) {
        app.dock.setBadge(totalUnreadCount ? totalUnreadCount.toString() : '')
      }

      updateTrayUnreadStatus(totalUnreadCount)

      sendToMainWindow('unread-counts-updated', unreadCounts)
    }
  })

  if (Notification.isSupported()) {
    ipcMain.on('gmail:new-mails', (event, mails: Mail[]) => {
      for (const mail of mails) {
        newMailNotification(mail, event.sender)
      }
    })
  }
}
