import { app, ipcMain } from 'electron'
import { is } from 'electron-util'
import Store = require('electron-store')
import { getPlatformUserAgentFix } from './user-agent'
import { DEFAULT_ACCOUNT_ID } from './constants'

interface LastWindowState {
  bounds: {
    width: number
    height: number
    x: number | undefined
    y: number | undefined
  }
  fullscreen: boolean
  maximized: boolean
}

export interface Account {
  id: string
  label: string
  selected: boolean
}

export enum ConfigKey {
  AutoUpdateCheck = 'autoUpdateCheck',
  NotifyUpdateDownloaded = 'notifyUpdateDownloaded',
  SkipUpdateVersion = 'skipUpdateVersion',
  CompactHeader = 'compactHeader',
  HideFooter = 'hideFooter',
  HideSupport = 'hideSupport',
  LastWindowState = 'lastWindowState',
  LaunchMinimized = 'launchMinimized',
  AutoHideMenuBar = 'autoHideMenuBar',
  EnableTrayIcon = 'enableTrayIcon',
  ShowDockIcon = 'showDockIcon',
  CustomUserAgent = 'customUserAgent',
  AutoFixUserAgent = 'autoFixUserAgent',
  TrustedHosts = 'trustedHosts',
  ConfirmExternalLinks = 'confirmExternalLinks',
  HardwareAcceleration = 'hardwareAcceleration',
  DownloadsShowSaveAs = 'downloadsShowSaveAs',
  DownloadsOpenFolderWhenDone = 'downloadsOpenFolderWhenDone',
  DownloadsLocation = 'downloadsLocation',
  DarkMode = 'darkMode',
  ResetConfig = 'resetConfig',
  ReleaseChannel = 'releaseChannel',
  Accounts = 'accounts',
  ZoomFactor = 'zoomFactor',
  TitleBarStyle = 'titleBarStyle',
  NotificationsShowSender = 'notificationsShowSender',
  NotificationsShowSubject = 'notificationsShowSubject',
  NotificationsShowSummary = 'notificationsShowSummary',
  NotificationsDisabled = 'notificationsDisabled',
  NotificationsSilent = 'notificationsSilent',
  NotificationsAutoClose = 'notificationsAutoClose'
}

type TypedStore = {
  [ConfigKey.AutoUpdateCheck]: boolean
  [ConfigKey.NotifyUpdateDownloaded]: boolean
  [ConfigKey.SkipUpdateVersion]: string
  [ConfigKey.LastWindowState]: LastWindowState
  [ConfigKey.CompactHeader]: boolean
  [ConfigKey.HideFooter]: boolean
  [ConfigKey.HideSupport]: boolean
  [ConfigKey.LaunchMinimized]: boolean
  [ConfigKey.AutoHideMenuBar]: boolean
  [ConfigKey.EnableTrayIcon]: boolean
  [ConfigKey.ShowDockIcon]: boolean
  [ConfigKey.CustomUserAgent]: string
  [ConfigKey.AutoFixUserAgent]: boolean
  [ConfigKey.TrustedHosts]: string[]
  [ConfigKey.ConfirmExternalLinks]: boolean
  [ConfigKey.HardwareAcceleration]: boolean
  [ConfigKey.DownloadsShowSaveAs]: boolean
  [ConfigKey.DownloadsOpenFolderWhenDone]: boolean
  [ConfigKey.DownloadsLocation]: string
  [ConfigKey.DarkMode]: 'system' | boolean
  [ConfigKey.ResetConfig]: boolean
  [ConfigKey.ReleaseChannel]: 'stable' | 'dev'
  [ConfigKey.Accounts]: Account[]
  [ConfigKey.ZoomFactor]: number
  [ConfigKey.TitleBarStyle]: 'system' | 'app'
  [ConfigKey.NotificationsShowSender]: boolean
  [ConfigKey.NotificationsShowSubject]: boolean
  [ConfigKey.NotificationsShowSummary]: boolean
  [ConfigKey.NotificationsDisabled]: boolean
  [ConfigKey.NotificationsSilent]: boolean
  [ConfigKey.NotificationsAutoClose]: boolean
}

const defaults: TypedStore = {
  [ConfigKey.AutoUpdateCheck]: true,
  [ConfigKey.NotifyUpdateDownloaded]: true,
  [ConfigKey.SkipUpdateVersion]: '',
  [ConfigKey.LastWindowState]: {
    bounds: {
      width: 860,
      height: 600,
      x: undefined,
      y: undefined
    },
    fullscreen: false,
    maximized: false
  },
  [ConfigKey.CompactHeader]: true,
  [ConfigKey.HideFooter]: true,
  [ConfigKey.HideSupport]: true,
  [ConfigKey.LaunchMinimized]: false,
  [ConfigKey.AutoHideMenuBar]: false,
  [ConfigKey.EnableTrayIcon]: !is.macos,
  [ConfigKey.ShowDockIcon]: true,
  [ConfigKey.CustomUserAgent]: '',
  [ConfigKey.AutoFixUserAgent]: true,
  [ConfigKey.TrustedHosts]: [],
  [ConfigKey.ConfirmExternalLinks]: true,
  [ConfigKey.HardwareAcceleration]: true,
  [ConfigKey.DownloadsShowSaveAs]: false,
  [ConfigKey.DownloadsOpenFolderWhenDone]: false,
  [ConfigKey.DownloadsLocation]: app.getPath('downloads'),
  [ConfigKey.DarkMode]: 'system',
  [ConfigKey.ResetConfig]: false,
  [ConfigKey.ReleaseChannel]: 'stable',
  [ConfigKey.Accounts]: [
    {
      id: DEFAULT_ACCOUNT_ID,
      label: 'Default',
      selected: true
    }
  ],
  [ConfigKey.ZoomFactor]: 1,
  [ConfigKey.TitleBarStyle]: 'app',
  [ConfigKey.NotificationsShowSender]: true,
  [ConfigKey.NotificationsShowSubject]: true,
  [ConfigKey.NotificationsShowSummary]: true,
  [ConfigKey.NotificationsDisabled]: false,
  [ConfigKey.NotificationsSilent]: false,
  [ConfigKey.NotificationsAutoClose]: true
}

const config = new Store<TypedStore>({
  defaults,
  name: is.development ? 'config.dev' : 'config',
  migrations: {
    '>=2.21.2': (store) => {
      const hideRightSidebar: boolean | undefined = store.get(
        'hideRightSidebar'
      )

      if (typeof hideRightSidebar === 'boolean') {
        // @ts-expect-error
        store.delete('hideRightSidebar')
      }
    },
    '>2.21.2': (store) => {
      const overrideUserAgent: string | undefined = store.get(
        'overrideUserAgent'
      )

      if (typeof overrideUserAgent === 'string') {
        if (overrideUserAgent.length > 0) {
          store.set(ConfigKey.CustomUserAgent, overrideUserAgent)
        }

        // @ts-expect-error
        store.delete('overrideUserAgent')
      }
    },
    '>3.0.0-alpha.2': (store) => {
      const customUserAgent: string = store.get('customUserAgent')

      if (customUserAgent === getPlatformUserAgentFix()) {
        store.set('customUserAgent', '')
      }
    }
  }
})

if (config.get(ConfigKey.ResetConfig)) {
  config.clear()
  config.set(ConfigKey.ResetConfig, false)
}

ipcMain.handle('config:compact-header', () =>
  config.get(ConfigKey.CompactHeader)
)

export default config
