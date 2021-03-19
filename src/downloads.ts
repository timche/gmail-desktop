import { shell } from 'electron'
import * as path from 'path'
import electronDl = require('electron-dl')
import config, { ConfigKey } from './config'
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
    () => {
      shell.openPath(
        path.join(config.get(ConfigKey.DownloadsLocation), filename)
      )
    }
  )
}

export function init(): void {
  const openFolderWhenDone = config.get(ConfigKey.DownloadsOpenFolderWhenDone)
  const handleStarted = (item: Electron.DownloadItem) => {
    item.once('done', (_, state) => {
      onDownloadComplete(item.getFilename(), state)
    })
  }

  electronDl({
    saveAs: config.get(ConfigKey.DownloadsShowSaveAs),
    openFolderWhenDone,
    directory: config.get(ConfigKey.DownloadsLocation),
    showBadge: false,
    onStarted: openFolderWhenDone ? undefined : handleStarted
  })
}
