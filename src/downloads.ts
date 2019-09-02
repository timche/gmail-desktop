import { shell, app } from 'electron'
import * as path from 'path'
import electronDl from 'electron-dl'

import { createNotification } from './notifications'

type State = 'cancelled' | 'completed' | 'interrupted'

const messages = {
  cancelled: 'has been cancelled',
  completed: 'has completed',
  interrupted: 'has been interrupted'
}

function onDownloadComplete(filename: string, state: State): void {
  createNotification(
    `Download ${state}`,
    `Download of file ${filename} ${messages[state]}.`,
    {
      action: () => {
        shell.openItem(path.join(app.getPath('downloads'), filename))
      },
      text: 'Open'
    }
  )
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
