import {
  app,
  shell,
  Menu,
  MenuItemConstructorOptions,
  dialog,
  nativeTheme
} from 'electron'
import * as fs from 'fs'
import { is } from 'electron-util'
import {
  manuallyCheckForUpdates,
  changeReleaseChannel,
  setAutoUpdateCheck
} from '../updates'
import config, { ConfigKey } from '../config'
import {
  setCustomStyle,
  USER_CUSTOM_STYLE_PATH
} from '../account-views/custom-styles'
import { viewLogs } from '../utils/logs'
import { showRestartDialog } from '../utils/dialog'
import { enableAutoFixUserAgent, removeCustomUserAgent } from '../user-agent'
import {
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
import { gmailUrl } from '../../constants'

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
          role: 'about'
        },
        {
          label: 'Check for Updates...',
          click() {
            manuallyCheckForUpdates()
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Preferences',
          submenu: [
            {
              label: 'Dark Mode',
              submenu: [
                {
                  id: 'dark-mode-system',
                  label: 'Follow System Appearance',
                  type: 'radio',
                  checked: config.get(ConfigKey.DarkMode) === 'system',
                  click() {
                    nativeTheme.themeSource = 'system'
                    config.set(ConfigKey.DarkMode, 'system')
                  }
                },
                {
                  id: 'dark-mode-enabled',
                  label: 'Enabled',
                  type: 'radio',
                  checked: config.get(ConfigKey.DarkMode) === true,
                  click() {
                    nativeTheme.themeSource = 'dark'
                    config.set(ConfigKey.DarkMode, true)
                  }
                },
                {
                  id: 'dark-mode-disabled',
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
                  label: 'Custom Styles',
                  click() {
                    // Create the custom style file if it doesn't exist
                    if (!fs.existsSync(USER_CUSTOM_STYLE_PATH)) {
                      fs.closeSync(fs.openSync(USER_CUSTOM_STYLE_PATH, 'w'))
                    }

                    shell.openPath(USER_CUSTOM_STYLE_PATH)
                  }
                }
              ]
            },
            {
              label: 'Hide Menu bar',
              visible: !is.macos,
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
              label: is.macos ? 'Show Menu Bar Icon' : 'Show System Tray Icon',
              type: 'checkbox',
              checked: config.get(ConfigKey.EnableTrayIcon),
              click({ checked }: { checked: boolean }) {
                config.set(ConfigKey.EnableTrayIcon, checked)
                showRestartDialog()
              }
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
              label: 'Default Mailto Client',
              type: 'checkbox',
              checked: app.isDefaultProtocolClient('mailto'),
              click() {
                if (app.isDefaultProtocolClient('mailto')) {
                  app.removeAsDefaultProtocolClient('mailto')
                } else {
                  app.setAsDefaultProtocolClient('mailto')
                }
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
              label: 'Hardware Acceleration',
              type: 'checkbox',
              checked: config.get(ConfigKey.HardwareAcceleration),
              click({ checked }: { checked: boolean }) {
                config.set(ConfigKey.HardwareAcceleration, checked)
                showRestartDialog()
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
                },
                {
                  label: 'Close Automatically',
                  type: 'checkbox',
                  checked: config.get(ConfigKey.NotificationsAutoClose),
                  click({ checked }) {
                    config.set(ConfigKey.NotificationsAutoClose, checked)
                  }
                }
              ]
            },
            {
              type: 'separator'
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
              label: 'Advanced',
              submenu: [
                {
                  label: 'Edit Config File',
                  click() {
                    config.openInEditor()
                  }
                },
                {
                  label: 'Reset Config File',
                  click() {
                    config.set(ConfigKey.ResetConfig, true)
                    showRestartDialog()
                  }
                },
                {
                  type: 'separator'
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
            }
          ]
        },
        {
          label: 'Gmail Preferences',
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
      role: 'editMenu'
    },
    {
      label: 'View',
      submenu: [
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
          label: `${app.name} Website`,
          click() {
            shell.openExternal('https://github.com/timche/gmail-desktop')
          }
        },
        {
          label: 'Report an Issue',
          click() {
            shell.openExternal(
              'https://github.com/timche/gmail-desktop/issues/new/choose'
            )
          }
        },
        {
          label: 'View Logs',
          click() {
            viewLogs()
          }
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
