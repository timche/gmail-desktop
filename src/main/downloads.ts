import { shell } from 'electron'
import * as path from 'path'
import electronDl = require('electron-dl')
import config, { ConfigKey } from './config'
import { createNotification } from './utils/notifications'

export function initDownloads(): void {
  const openFolderWhenDone = config.get(ConfigKey.DownloadsOpenFolderWhenDone)

  const handleStarted = (item: Electron.DownloadItem) => {
    item.once('done', (_, state) => {
      const fileName = item.getFilename()

      createNotification(`Download ${state}`, fileName, () => {
        shell.openPath(
          path.join(config.get(ConfigKey.DownloadsLocation), fileName)
        )
      })
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
