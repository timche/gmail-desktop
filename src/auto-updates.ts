import { app, Notification } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { is } from 'electron-util'

const UPDATE_CHECK_INTERVAL = 60000 * 60 * 3 // 3 Hours

function onUpdateAvailable(): void {
  const notification = new Notification({
    actions: [
      {
        type: 'button',
        text: 'Restart'
      }
    ],
    body: 'Please restart to update to the latest version',
    title: 'Update available'
  })

  notification.on('action', () => {
    app.relaunch()
    app.quit()
  })

  notification.show()
}

export function init(): void {
  if (!is.development) {
    log.transports.file.level = 'info'
    autoUpdater.logger = log

    autoUpdater.on('update-downloaded', onUpdateAvailable)

    setInterval(() => autoUpdater.checkForUpdates, UPDATE_CHECK_INTERVAL)
    autoUpdater.checkForUpdates()
  }
}
