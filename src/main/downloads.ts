import { shell } from 'electron'
import electronDl = require('electron-dl')
import config, { ConfigKey } from './config'
import { createNotification } from './utils/notifications'

export function initDownloads(): void {
  const openFolderWhenDone = config.get(ConfigKey.DownloadsOpenFolderWhenDone)

  const handleStarted = (item: Electron.DownloadItem) => {
    item.once('done', (_, state) => {
      const fileName = item.getFilename()
      const filePath = item.getSavePath()

      createNotification(`Download ${state}`, fileName, () => {
        shell.openPath(filePath)
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
