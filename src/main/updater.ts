import { app, dialog, ipcMain } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { CancellationToken, HttpError } from 'builder-util-runtime'
import { is } from 'electron-util'
import config, { ConfigKey } from './config'
import { initOrUpdateAppMenu } from './menus/app'
import { sendToMainWindow, showMainWindow } from './main-window'
import {
  hideAccountViews,
  showAccountViews,
  updateAllAccountViewBounds
} from './account-views'
import { createNotification } from './utils/notifications'
import { AppUpdateInfo } from '../types'
import { setIsQuittingApp } from './app'
import { appName } from '../constants'

const autoUpdateCheckInterval = 60000 * 60 * 2 // Hours
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
    }, autoUpdateCheckInterval)
  } else if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval)
  }
}

export function changeReleaseChannel(channel: 'stable' | 'dev') {
  autoUpdater.allowPrerelease = channel === 'dev'
  autoUpdater.allowDowngrade = true
  checkForUpdatesWithFeedback()
  config.set(ConfigKey.ReleaseChannel, channel)
}

export function showUpdateAvailable({ version, releaseNotes }: AppUpdateInfo) {
  isUpdateAvailable = true

  sendToMainWindow('updater:available', {
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
    detail: `${appName} v${currentVersion} is currently the newest version available.`
  })
}

export async function checkForUpdatesWithFeedback(): Promise<void> {
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

export function initUpdater(): void {
  if (is.development) {
    return
  }

  ipcMain.on('updater:download', () => {
    downloadCancellationToken = new CancellationToken()
    autoUpdater.downloadUpdate(downloadCancellationToken)
  })

  ipcMain.on('updater:skip-version', (_event, version: string) => {
    isUpdateAvailable = false
    config.set(ConfigKey.SkipUpdateVersion, version)
    showAccountViews()
    updateAllAccountViewBounds()
  })

  ipcMain.on('updater:install', () => {
    setIsQuittingApp(true)
    autoUpdater.quitAndInstall()
  })

  ipcMain.on('updater:dismiss', () => {
    isUpdateAvailable = false
    showAccountViews()
    updateAllAccountViewBounds()
  })

  ipcMain.on('updater:cancel-download', () => {
    downloadCancellationToken.cancel()
    isUpdateAvailable = false
    updateAllAccountViewBounds()
  })

  ipcMain.on('updater:toggle-release-notes', (_event, visible: boolean) => {
    if (visible) {
      hideAccountViews()
    } else {
      showAccountViews()
    }
  })

  autoUpdater.on('update-available', (updateInfo: AppUpdateInfo) => {
    const skipUpdateVersion = config.get(ConfigKey.SkipUpdateVersion)
    if (updateInfo.version !== skipUpdateVersion) {
      showMainWindow()
      showUpdateAvailable(updateInfo)
    }
  })

  autoUpdater.on('download-progress', ({ percent }: { percent: number }) => {
    sendToMainWindow('updater:download-progress', percent)
  })

  autoUpdater.on('update-downloaded', () => {
    sendToMainWindow('updater:install')
    createNotification(
      'Update downloaded',
      'A restart is required to install the update.'
    )
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
