import { app, ipcMain as ipc } from 'electron'
import { is } from 'electron-util'
import { updateTrayUnreadStatus } from './tray'
import { sendToMainWindow } from './main-window'
import { getAccountIdByViewId } from './account-views'

const unreadCounts: Record<string, number> = {}

export function getTotalUnreadCount() {
  let totalUnreadCount = 0

  for (const unreadCount of Object.values(unreadCounts)) {
    totalUnreadCount += unreadCount
  }

  return totalUnreadCount
}

export function handleUnreadCount() {
  ipc.on('unread-count', ({ sender }, unreadCount: number) => {
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
}
