import { app } from 'electron'
import { is } from 'electron-util'
import { updateTrayUnreadStatus } from './tray'

const unreadCount: { [accountId: string]: number } = {}

export function updateUnreadCount(accountId: string, newCount: number) {
  unreadCount[accountId] = newCount

  const totalUnreadCount = getTotalUnreadCount()

  if (is.macos) {
    app.dock.setBadge(totalUnreadCount ? totalUnreadCount.toString() : '')
  }

  updateTrayUnreadStatus(totalUnreadCount)

  return totalUnreadCount
}

export function getTotalUnreadCount() {
  return Object.values(unreadCount).reduce((prev, cur) => prev + cur, 0)
}
