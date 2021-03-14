import { app, ipcMain as ipc } from 'electron'
import { is } from 'electron-util'
import { updateTrayUnreadStatus } from './tray'
import { sendChannelToAllWindows } from './utils'
import { getViewAccountId } from './views'

const unreadCounts: Record<string, number> = {}

export function getTotalUnreadCount() {
  let totalUnreadCount = 0

  for (const unreadCount of Object.values(unreadCounts)) {
    totalUnreadCount += unreadCount
  }

  return totalUnreadCount
}

export function updateUnreadCount(accountId: string, newCount: number) {
  unreadCounts[accountId] = newCount

  const totalUnreadCount = getTotalUnreadCount()

  if (is.macos) {
    app.dock.setBadge(totalUnreadCount ? totalUnreadCount.toString() : '')
  }

  updateTrayUnreadStatus(totalUnreadCount)

  return totalUnreadCount
}

export function handleUnreadCount() {
  ipc.on('unread-count', ({ sender }, unreadCount: number) => {
    const accountId = getViewAccountId(sender.id)

    if (accountId) {
      updateUnreadCount(accountId, unreadCount)
      sendChannelToAllWindows('unread-count', accountId, unreadCount)
    }
  })
}
