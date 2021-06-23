import path from 'path'
import {
  app,
  shell,
  Menu,
  MenuItemConstructorOptions,
  dialog,
  nativeTheme,
  session,
  nativeImage
} from 'electron'
import * as fs from 'fs'
import { is } from 'electron-util'
import {
  checkForUpdatesWithFeedback,
  changeReleaseChannel,
  setAutoUpdateCheck
} from '../updater'
import config, { ConfigKey } from '../config'
import { setCustomStyle, userStylesPath } from '../account-views/custom-styles'
import log from 'electron-log'
import { showRestartDialog } from '../utils/dialog'
import { enableAutoFixUserAgent, removeCustomUserAgent } from '../user-agent'
import {
  getAccounts,
  getAccountsMenuItems,
  getSelectedAccount,
  isDefaultAccount,
  removeAccount
} from '../accounts'
import { getMainWindow, sendToMainWindow } from '../main-window'
import {
  forEachAccountView,
  getSelectedAccountView,
  hideAccountViews,
  sendToSelectedAccountView
} from '../account-views'
import { gitHubRepoUrl, gmailUrl } from '../../constants'
import { openExternalUrl } from '../utils/url'

interface AppearanceMenuItem {
  key: ConfigKey
  label: string
  restartRequired?: boolean
  click?: (checked?: boolean) => void
}

export function getAppMenu() {
  const appearanceMenuItems: AppearanceMenuItem[] = [
    {
      key: ConfigKey.CompactHeader,
      label: 'Compact Header',
      restartRequired: true
    },
    {
      key: ConfigKey.HideFooter,
      label: 'Hide Footer'
    },
    {
      key: ConfigKey.HideSupport,
      label: 'Hide Support'
    }
  ]

  const createAppearanceMenuItem = ({
    key,
    label,
    restartRequired
  }: AppearanceMenuItem): MenuItemConstructorOptions => ({
    label,
    type: 'checkbox',
    checked: config.get(key) as boolean,
    click({ checked }: { checked: boolean }) {
      config.set(key, checked)

      if (restartRequired) {
        showRestartDialog()
      } else {
        setCustomStyle(key, checked)
      }
    }
  })

  const appMenuTemplate: MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        {
          label: `About ${app.name}`,
          click() {
            dialog.showMessageBox({
              icon: nativeImage.createFromPath(
                path.join(__dirname, '..', '..', 'static', 'icon.png')
              ),
              message: `${app.name}`,
              detail: `Version: ${app.getVersion()} (${config.get(
                ConfigKey.ReleaseChannel
              )})\n\nCreated by Tim Cheung <tim@cheung.io>\n\nCopyright © 2021 Tim Cheung`
            })
          }
        },
        {
          label: 'Check for Updates...',
          click() {
            checkForUpdatesWithFeedback()
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Preferences',
          submenu: [
            {
              label: 'Hide Menu bar',
              visible: !is.macos,
              type: 'checkbox',
              checked: config.get(ConfigKey.AutoHideMenuBar),
              click({ checked }) {
                config.set(ConfigKey.AutoHideMenuBar, checked)
                const mainWindow = getMainWindow()
                mainWindow.setMenuBarVisibility(!checked)
                mainWindow.autoHideMenuBar = checked

                if (checked) {
                  dialog.showMessageBox({
                    type: 'info',
                    buttons: ['OK'],
                    message:
                      'Tip: You can press the Alt key to see the menu bar again.'
                  })
                }
              }
            },
            {
              label: 'Title Bar Style',
              visible: is.linux,
              submenu: [
                {
                  label: 'App',
                  type: 'radio',
                  checked: config.get(ConfigKey.TitleBarStyle) === 'app',
                  click() {
                    config.set(ConfigKey.TitleBarStyle, 'app')
                    showRestartDialog()
                  }
                },
                {
                  label: 'System',
                  type: 'radio',
                  checked: config.get(ConfigKey.TitleBarStyle) === 'system',
                  click() {
                    config.set(ConfigKey.TitleBarStyle, 'system')
                    showRestartDialog()
                  }
                }
              ]
            },
            {
              label: 'Confirm External Links before Opening',
              type: 'checkbox',
              checked: config.get(ConfigKey.ConfirmExternalLinks),
              click({ checked }: { checked: boolean }) {
                config.set(ConfigKey.ConfirmExternalLinks, checked)
              }
            },
            {
              label: 'Downloads',
              submenu: [
                {
                  label: 'Show Save As Dialog Before Downloading',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.DownloadsShowSaveAs),
                  click({ checked }) {
                    config.set(ConfigKey.DownloadsShowSaveAs, checked)

                    showRestartDialog()
                  }
                },
                {
                  label: 'Open Folder When Done',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.DownloadsOpenFolderWhenDone),
                  click({ checked }) {
                    config.set(ConfigKey.DownloadsOpenFolderWhenDone, checked)

                    showRestartDialog()
                  }
                },
                {
                  label: 'Set Default Location',
                  async click() {
                    const { canceled, filePaths } = await dialog.showOpenDialog(
                      {
                        properties: ['openDirectory'],
                        buttonLabel: 'Select',
                        defaultPath: config.get(ConfigKey.DownloadsLocation)
                      }
                    )

                    if (canceled) {
                      return
                    }

                    config.set(ConfigKey.DownloadsLocation, filePaths[0])

                    showRestartDialog()
                  }
                }
              ]
            },
            {
              label: 'Notifications',
              submenu: [
                {
                  label: 'Enabled',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.NotificationsEnabled),
                  click({ checked }) {
                    config.set(ConfigKey.NotificationsEnabled, checked)
                  }
                },
                {
                  type: 'separator'
                },
                {
                  label: 'Show Sender',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.NotificationsShowSender),
                  click({ checked }) {
                    config.set(ConfigKey.NotificationsShowSender, checked)
                  }
                },
                {
                  label: 'Show Subject',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.NotificationsShowSubject),
                  click({ checked }) {
                    config.set(ConfigKey.NotificationsShowSubject, checked)
                  }
                },
                {
                  label: 'Show Summary',
                  type: 'checkbox',
                  visible: is.macos,
                  checked: config.get(ConfigKey.NotificationsShowSummary),
                  click({ checked }) {
                    config.set(ConfigKey.NotificationsShowSummary, checked)
                  }
                },
                {
                  type: 'separator'
                },
                {
                  label: 'Play Sound',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.NotificationsPlaySound),
                  click({ checked }) {
                    config.set(ConfigKey.NotificationsPlaySound, checked)
                  }
                }
              ]
            },
            {
              type: 'separator'
            },
            {
              label: 'Default Mail Client',
              type: 'checkbox',
              checked: app.isDefaultProtocolClient('mailto'),
              click({ checked }) {
                if (checked) {
                  const isSetMailClient = app.setAsDefaultProtocolClient(
                    'mailto'
                  )

                  dialog.showMessageBox({
                    type: 'info',
                    message: isSetMailClient
                      ? `${app.name} is now set as default mail client.`
                      : `There was a problem with setting ${app.name} as default mail client.`
                  })
                } else {
                  const isUnsetMailClient = app.removeAsDefaultProtocolClient(
                    'mailto'
                  )

                  dialog.showMessageBox({
                    type: 'info',
                    message: isUnsetMailClient
                      ? `${app.name} has been removed as default mail client.`
                      : `There was a problem with removing ${app.name} as default mail client.`
                  })
                }
              }
            },
            {
              label: is.macos ? 'Show Menu Bar Icon' : 'Show System Tray Icon',
              type: 'checkbox',
              checked: config.get(ConfigKey.EnableTrayIcon),
              click({ checked }: { checked: boolean }) {
                config.set(ConfigKey.EnableTrayIcon, checked)
                showRestartDialog()
              }
            },
            {
              label: 'Launch Minimized',
              type: 'checkbox',
              checked: config.get(ConfigKey.LaunchMinimized),
              click({ checked }: { checked: boolean }) {
                config.set(ConfigKey.LaunchMinimized, checked)
              }
            },
            {
              label: 'Launch at Login',
              visible: is.macos || is.windows,
              type: 'checkbox',
              checked: app.getLoginItemSettings().openAtLogin,
              click(menuItem) {
                app.setLoginItemSettings({
                  openAtLogin: menuItem.checked,
                  openAsHidden: menuItem.checked
                })
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Hardware Acceleration',
              type: 'checkbox',
              checked: config.get(ConfigKey.HardwareAcceleration),
              click({ checked }: { checked: boolean }) {
                config.set(ConfigKey.HardwareAcceleration, checked)
                showRestartDialog()
              }
            },
            {
              label: 'Blocker',
              submenu: [
                {
                  label: 'Enabled',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.BlockerEnabled),
                  click({ checked }) {
                    config.set(ConfigKey.BlockerEnabled, checked)
                    showRestartDialog()
                  }
                },
                {
                  type: 'separator'
                },
                {
                  label: 'Block Ads',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.BlockerBlockAds),
                  click({ checked }) {
                    config.set(ConfigKey.BlockerBlockAds, checked)
                    showRestartDialog()
                  }
                },
                {
                  label: 'Block Analytics',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.BlockerBlockAnalytics),
                  click({ checked }) {
                    config.set(ConfigKey.BlockerBlockAnalytics, checked)
                    showRestartDialog()
                  }
                },
                {
                  label: 'Block Email Trackers',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.BlockerBlockEmailTrackers),
                  click({ checked }) {
                    config.set(ConfigKey.BlockerBlockEmailTrackers, checked)
                    showRestartDialog()
                  }
                }
              ]
            },
            {
              label: 'Updates',
              submenu: [
                {
                  label: 'Check For Updates Automatically',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.AutoUpdateCheck),
                  click({ checked }: { checked: boolean }) {
                    setAutoUpdateCheck(checked)
                    config.set(ConfigKey.AutoUpdateCheck, checked)
                  }
                },
                {
                  label: 'Notify When Update Downloaded',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.NotifyUpdateDownloaded),
                  click({ checked }: { checked: boolean }) {
                    config.set(ConfigKey.NotifyUpdateDownloaded, checked)
                  }
                },
                {
                  label: 'Release Channel',
                  submenu: [
                    {
                      id: 'release-channel-stable',
                      label: 'Stable',
                      type: 'radio',
                      checked:
                        config.get(ConfigKey.ReleaseChannel) === 'stable',
                      click() {
                        changeReleaseChannel('stable')
                      }
                    },
                    {
                      label: 'Dev',
                      type: 'radio',
                      checked: config.get(ConfigKey.ReleaseChannel) === 'dev',
                      click() {
                        changeReleaseChannel('dev')
                      }
                    }
                  ]
                }
              ]
            },
            {
              label: 'User Agent',
              submenu: [
                {
                  label: 'Use User Agent Fix',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.AutoFixUserAgent),
                  click({ checked }) {
                    enableAutoFixUserAgent({
                      enable: checked,
                      showRestartDialog: true
                    })
                  }
                },
                {
                  label: 'Set Custom User Agent',
                  click() {
                    config.openInEditor()
                  }
                },
                {
                  label: 'Remove Custom User Agent',
                  enabled: Boolean(config.get(ConfigKey.CustomUserAgent)),
                  click() {
                    removeCustomUserAgent()
                  }
                }
              ]
            }
          ]
        },
        {
          label: 'Gmail Settings',
          accelerator: 'Command+,',
          click() {
            sendToSelectedAccountView('gmail:go-to', 'settings')
          }
        },
        {
          type: 'separator'
        },
        {
          label: `Hide ${app.name}`,
          accelerator: 'CommandOrControl+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'CommandOrControl+Shift+H',
          role: 'hideOthers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: `Quit ${app.name}`,
          accelerator: 'CommandOrControl+Q',
          click() {
            app.quit()
          }
        }
      ]
    },
    {
      role: 'fileMenu',
      submenu: [
        {
          label: 'Compose',
          click() {
            sendToSelectedAccountView('gmail:compose-mail')
          }
        },
        {
          type: 'separator'
        },
        {
          role: 'close'
        }
      ]
    },
    {
      label: 'Account',
      submenu: [
        ...getAccountsMenuItems(true),
        {
          type: 'separator'
        },
        {
          label: 'Add Account',
          click() {
            sendToMainWindow('add-account-request')
            hideAccountViews()
          }
        },
        {
          label: 'Edit Account',
          click() {
            const selectedAccount = getSelectedAccount()
            if (selectedAccount) {
              sendToMainWindow('edit-account-request', selectedAccount)
              hideAccountViews()
            }
          }
        },
        {
          label: 'Remove Account',
          async click() {
            const selectedAccount = getSelectedAccount()

            if (selectedAccount) {
              if (isDefaultAccount(selectedAccount.id)) {
                dialog.showMessageBox({
                  type: 'info',
                  message: "The default account can't be removed."
                })
                return
              }

              const { response } = await dialog.showMessageBox({
                type: 'warning',
                message:
                  'Do you really want to remove the currently selected account?',
                buttons: ['Confirm', 'Cancel']
              })

              if (response === 0) {
                removeAccount(selectedAccount.id)
              }
            }
          }
        }
      ]
    },
    {
      role: 'editMenu',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'pasteAndMatchStyle',
          accelerator: 'CommandOrControl+Shift+V'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectAll'
        },
        {
          type: 'separator'
        },
        {
          label: 'Speech',
          submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dark Mode',
          submenu: [
            {
              label: 'Follow System Appearance',
              type: 'radio',
              checked: config.get(ConfigKey.DarkMode) === 'system',
              click() {
                nativeTheme.themeSource = 'system'
                config.set(ConfigKey.DarkMode, 'system')
              }
            },
            {
              label: 'Enabled',
              type: 'radio',
              checked: config.get(ConfigKey.DarkMode) === true,
              click() {
                nativeTheme.themeSource = 'dark'
                config.set(ConfigKey.DarkMode, true)
              }
            },
            {
              label: 'Disabled',
              type: 'radio',
              checked: config.get(ConfigKey.DarkMode) === false,
              click() {
                nativeTheme.themeSource = 'light'
                config.set(ConfigKey.DarkMode, false)
              }
            }
          ]
        },
        {
          label: 'Gmail Appearance',
          submenu: [
            ...appearanceMenuItems.map((item) =>
              createAppearanceMenuItem(item)
            ),
            {
              type: 'separator'
            },
            {
              label: 'Edit User Styles',
              click() {
                if (!fs.existsSync(userStylesPath)) {
                  fs.closeSync(fs.openSync(userStylesPath, 'w'))
                }

                shell.openPath(userStylesPath)
              }
            }
          ]
        },
        {
          type: 'separator'
        },
        {
          label: 'Reload',
          accelerator: 'CommandOrControl+R',
          click() {
            const selectedAccountView = getSelectedAccountView()
            if (selectedAccountView) {
              selectedAccountView.webContents.loadURL(gmailUrl)
            }
          }
        },
        {
          label: 'Full Reload',
          accelerator: 'CommandOrControl+Shift+R',
          click() {
            const mainWindow = getMainWindow()
            mainWindow.reload()
            forEachAccountView((accountView) => {
              accountView.webContents.loadURL(gmailUrl)
            })
          }
        },
        {
          label: 'Developer Tools',
          accelerator: is.macos ? 'Command+Alt+I' : 'Control+Shift+I',
          click() {
            getMainWindow().webContents.openDevTools({ mode: 'detach' })
            const selectedAccountView = getSelectedAccountView()
            if (selectedAccountView) {
              selectedAccountView.webContents.openDevTools()
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CommandOrControl+0',
          click() {
            const resetZoomFactor = 1
            forEachAccountView((accountView) => {
              accountView.webContents.setZoomFactor(resetZoomFactor)
            })
            config.set(ConfigKey.ZoomFactor, resetZoomFactor)
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CommandOrControl+Plus',
          click() {
            const newZoomFactor = config.get(ConfigKey.ZoomFactor) + 0.1
            forEachAccountView((accountView) => {
              accountView.webContents.setZoomFactor(newZoomFactor)
            })
            config.set(ConfigKey.ZoomFactor, newZoomFactor)
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CommandOrControl+-',
          click() {
            const newZoomFactor = config.get(ConfigKey.ZoomFactor) - 0.1
            if (newZoomFactor > 0) {
              forEachAccountView((accountView) => {
                accountView.webContents.setZoomFactor(newZoomFactor)
              })
              config.set(ConfigKey.ZoomFactor, newZoomFactor)
            }
          }
        }
      ]
    },
    {
      label: 'Go',
      submenu: [
        {
          type: 'separator'
        },
        {
          label: 'Inbox',
          click() {
            sendToSelectedAccountView('gmail:go-to', 'inbox')
            const mainWindow = getMainWindow()
            mainWindow.show()
          }
        },
        {
          label: 'Important',
          click() {
            sendToSelectedAccountView('gmail:go-to', 'imp')
            const mainWindow = getMainWindow()
            mainWindow.show()
          }
        },
        {
          label: 'Snoozed',
          click() {
            sendToSelectedAccountView('gmail:go-to', 'snoozed')
            const mainWindow = getMainWindow()
            mainWindow.show()
          }
        },
        {
          label: 'Starred',
          click() {
            sendToSelectedAccountView('gmail:go-to', 'starred')
            const mainWindow = getMainWindow()
            mainWindow.show()
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Drafts',
          click() {
            sendToSelectedAccountView('gmail:go-to', 'drafts')
            const mainWindow = getMainWindow()
            mainWindow.show()
          }
        },
        {
          label: 'Scheduled',
          click() {
            sendToSelectedAccountView('gmail:go-to', 'scheduled')
            const mainWindow = getMainWindow()
            mainWindow.show()
          }
        },
        {
          label: 'Sent',
          click() {
            sendToSelectedAccountView('gmail:go-to', 'sent')
            const mainWindow = getMainWindow()
            mainWindow.show()
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'All Mail',
          click() {
            sendToSelectedAccountView('gmail:go-to', 'all')
            const mainWindow = getMainWindow()
            mainWindow.show()
          }
        }
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CommandOrControl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CommandOrControl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Website',
          click() {
            openExternalUrl(gitHubRepoUrl)
          }
        },
        {
          label: 'Release Notes',
          click() {
            openExternalUrl(`${gitHubRepoUrl}/releases`)
          }
        },
        {
          label: 'Source Code',
          click() {
            openExternalUrl(gitHubRepoUrl)
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Gmail Keyboard Shortcuts',
          click() {
            openExternalUrl('https://support.google.com/mail/answer/6594')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Ask Questions',
          click() {
            openExternalUrl(`${gitHubRepoUrl}/discussions/categories/q-a`)
          }
        },
        {
          label: 'Search Feature Requests',
          click() {
            openExternalUrl(
              `${gitHubRepoUrl}/discussions/categories/feature-requests`
            )
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Report Issue',
          click() {
            openExternalUrl(`${gitHubRepoUrl}/issues/new/choose`)
          }
        },
        {
          label: 'Troubleshooting',
          submenu: [
            {
              label: 'Edit Config',
              click() {
                config.openInEditor()
              }
            },
            {
              label: 'Reset Config',
              click() {
                config.set(ConfigKey.ResetConfig, true)
                showRestartDialog()
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'Clear Cache',
              click() {
                const accounts = getAccounts()

                for (const { id } of accounts) {
                  if (isDefaultAccount(id)) {
                    session.defaultSession.clearCache()
                  } else {
                    session.fromPartition(`persist:${id}`).clearCache()
                  }
                }

                showRestartDialog()
              }
            },
            {
              label: 'Reset App Data',
              click() {
                const accounts = getAccounts()

                for (const { id } of accounts) {
                  if (isDefaultAccount(id)) {
                    session.defaultSession.clearStorageData()
                  } else {
                    session.fromPartition(`persist:${id}`).clearStorageData()
                  }
                }

                config.set(ConfigKey.ResetConfig, true)
                showRestartDialog()
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'View Logs',
              click() {
                shell.openPath(log.transports.file.getFile().path)
              }
            }
          ]
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(appMenuTemplate)
}

export function initOrUpdateAppMenu() {
  const appMenu = getAppMenu()
  Menu.setApplicationMenu(appMenu)
}
