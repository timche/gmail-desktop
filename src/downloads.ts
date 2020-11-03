import { shell, app } from 'electron'
import * as path from 'path'

import { createNotification } from './notifications'

import electronDl = require('electron-dl')

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
    () => {
      shell.openPath(path.join(app.getPath('downloads'), filename))
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
