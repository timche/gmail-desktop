const unreadCount: { [accountId: string]: number } = {}

export function updateUnreadCount(accountId: string, newCount: number) {
  const currentCount = unreadCount[accountId]

  unreadCount[accountId] =
    typeof currentCount === 'number' ? currentCount + newCount : newCount

  return getTotalUnreadCount()
}

export function getTotalUnreadCount() {
  return Object.values(unreadCount).reduce((prev, cur) => prev + cur, 0)
}
