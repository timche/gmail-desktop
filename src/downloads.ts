import { Notification, shell, app } from 'electron'
import * as path from 'path'
import electronDl from 'electron-dl'

type State = 'cancelled' | 'completed' | 'interrupted'

const messages = {
  cancelled: 'has been cancelled',
  completed: 'has completed',
  interrupted: 'has been interrupted'
}

function onDownloadComplete(filename: string, state: State): void {
  const notification = new Notification({
    actions: [
      {
        type: 'button',
        text: 'Open'
      }
    ],
    body: `Download of file ${filename} ${messages[state]}.`,
    title: `Download ${state}`
  })

  notification.on('action', () => {
    shell.openItem(path.join(app.getPath('downloads'), filename))
  })

  notification.show()
}

export function init(): void {
  electronDl({
    showBadge: false,
    onStarted: item => {
      item.on('done', (_, state) => {
        onDownloadComplete(item.getFilename(), state)
      })
    }
  })
}
