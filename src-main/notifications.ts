import { Notification } from 'electron'

export function createNotification(
  title: string,
  body: string,
  action?: () => void
): void {
  const notification = new Notification({
    body,
    title
  })

  if (action) {
    notification.on('click', action)
  }

  notification.show()
}
