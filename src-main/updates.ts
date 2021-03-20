import { app, dialog, ipcMain } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { CancellationToken, UpdateInfo, HttpError } from 'builder-util-runtime'
import { is } from 'electron-util'
import config, { ConfigKey } from './config'
import { initOrUpdateAppMenu } from './app-menu'
import { getMainWindow, sendToMainWindow } from './main-window'
import {
  hideAccountViews,
  showAccountViews,
  updateAllAccountViewBounds
} from './account-views'
import { setIsQuitting } from './app'
import { createNotification } from './notifications'

const AUTO_UPDATE_CHECK_INTERVAL = 60000 * 60 * 3 // 4 Hours

let autoUpdateInterval: ReturnType<typeof setInterval>
let isUpdateAvailable = false
let downloadCancellationToken: CancellationToken

export function getIsUpdateAvailable() {
  return isUpdateAvailable
}

export function setAutoUpdateCheck(enable: boolean) {
  if (enable) {
    if (autoUpdateInterval) {
      return
    }

    autoUpdateInterval = setInterval(() => {
      autoUpdater.checkForUpdates()
    }, AUTO_UPDATE_CHECK_INTERVAL)
  } else if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval)
  }
}

export function changeReleaseChannel(channel: 'stable' | 'dev') {
  autoUpdater.allowPrerelease = channel === 'dev'
  autoUpdater.allowDowngrade = true
  manuallyCheckForUpdates()
  config.set(ConfigKey.ReleaseChannel, channel)
}

export function showUpdateAvailable({ version, releaseNotes }: UpdateInfo) {
  isUpdateAvailable = true

  sendToMainWindow('update:available', {
    version,
    releaseNotes
  })

  updateAllAccountViewBounds()
}

function showUpToDate() {
  const currentVersion = app.getVersion()

  dialog.showMessageBox({
    type: 'info',
    message: `You're up to date!`,
    detail: `${app.name} v${currentVersion} is currently the newest version available.`
  })
}

export async function manuallyCheckForUpdates(): Promise<void> {
  try {
    const { updateInfo } = await autoUpdater.checkForUpdates()
    const currentVersion = app.getVersion()

    if (updateInfo.version === currentVersion) {
      showUpToDate()
    }
  } catch (error: unknown) {
    if (error instanceof HttpError && error.statusCode === 404) {
      showUpToDate()
      return
    }

    dialog.showMessageBox({
      type: 'info',
      message: 'Check for updates has failed',
      detail:
        error instanceof Error
          ? error.stack
          : typeof error === 'string'
          ? error
          : undefined
    })
  }
}

export function initUpdates(): void {
  if (is.development) {
    return
  }

  autoUpdater.on('update-available', (updateInfo) => {
    showUpdateAvailable(updateInfo)
    getMainWindow().show()
  })

  autoUpdater.on('download-progress', ({ percent }) => {
    sendToMainWindow('update:download-progress', percent)
  })

  autoUpdater.on('update-downloaded', () => {
    sendToMainWindow('update:install')
    createNotification(
      'Update downloaded',
      'A restart is required to install the update.'
    )
  })

  ipcMain.on('update:download', () => {
    downloadCancellationToken = new CancellationToken()
    autoUpdater.downloadUpdate(downloadCancellationToken)
  })

  ipcMain.on('update:install', () => {
    setIsQuitting(true)
    autoUpdater.quitAndInstall()
  })

  ipcMain.on('update:dismiss', () => {
    isUpdateAvailable = false
    showAccountViews()
    updateAllAccountViewBounds()
  })

  ipcMain.on('update:cancel-download', () => {
    downloadCancellationToken.cancel()
    isUpdateAvailable = false
    updateAllAccountViewBounds()
  })

  ipcMain.on('update:toggle-release-notes', (_event, visible: boolean) => {
    if (visible) {
      hideAccountViews()
    } else {
      showAccountViews()
    }
  })

  log.transports.file.level = 'info'

  autoUpdater.logger = log
  autoUpdater.fullChangelog = true
  autoUpdater.autoDownload = false

  if (
    autoUpdater.allowPrerelease &&
    config.get(ConfigKey.ReleaseChannel) === 'stable'
  ) {
    config.set(ConfigKey.ReleaseChannel, 'dev')
    initOrUpdateAppMenu()
  } else if (
    !autoUpdater.allowPrerelease &&
    config.get(ConfigKey.ReleaseChannel) === 'dev'
  ) {
    config.set(ConfigKey.ReleaseChannel, 'stable')
    initOrUpdateAppMenu()
  }

  if (config.get(ConfigKey.AutoUpdateCheck)) {
    setAutoUpdateCheck(true)
    autoUpdater.checkForUpdates()
  }
}
