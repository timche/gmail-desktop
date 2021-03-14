import { app, dialog } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { is } from 'electron-util'

import config, { ConfigKey } from './config'
import { viewLogs } from './logs'
import { createNotification } from './notifications'

const UPDATE_CHECK_INTERVAL = 60000 * 60 * 3 // 3 Hours

function onUpdateAvailable(): void {
  createNotification(
    'Update available',
    `Please restart ${app.name} to update to the latest version`,
    () => {
      app.relaunch()
      app.quit()
    }
  )
}

export function init(): void {
  if (!is.development) {
    log.transports.file.level = 'info'
    autoUpdater.logger = log

    autoUpdater.on('update-downloaded', onUpdateAvailable)

    if (config.get(ConfigKey.AutoUpdate)) {
      setInterval(() => autoUpdater.checkForUpdates, UPDATE_CHECK_INTERVAL)
      autoUpdater.checkForUpdates()
    }
  }
}

export async function checkForUpdates(): Promise<void> {
  try {
    const { downloadPromise } = await autoUpdater.checkForUpdates()

    // If there isn't an update, notify the user
    if (!downloadPromise) {
      dialog.showMessageBox({
        type: 'info',
        message: 'There are currently no updates available.'
      })
    }
  } catch (error: unknown) {
    log.error('Check for updates failed', error)

    createNotification(
      'Check for updates failed',
      'View the logs for more information',
      viewLogs
    )
  }
}
