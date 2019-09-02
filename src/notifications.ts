import { Notification } from 'electron'

interface Action {
  action: () => void
  text: string
}

export function createNotification(
  title: string,
  body: string,
  { action, text: actionText }: Action
): void {
  const notification = new Notification({
    actions: [
      {
        type: 'button',
        text: actionText
      }
    ],
    body,
    title
  })

  notification.on('action', () => action())
  notification.show()
}
