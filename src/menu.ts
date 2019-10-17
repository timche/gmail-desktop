import { app, shell, Menu, MenuItemConstructorOptions } from 'electron'
import * as fs from 'fs'
import { is } from 'electron-util'

import { checkForUpdates } from './updates'
import config, { ConfigKey } from './config'
import { setCustomStyle, USER_CUSTOM_STYLE_PATH } from './custom-styles'
import { viewLogs } from './logs'
import { showRestartDialog, setAppMenuBarVisibility } from './utils'

const APP_NAME = app.getName()

interface AppearanceMenuItem {
  key: ConfigKey
  label: string
  restartDialogText?: string
  setMenuBarVisibility?: boolean
}

const appearanceMenuItems: AppearanceMenuItem[] = [
  {
    key: ConfigKey.CompactHeader,
    label: 'Compact Header',
    restartDialogText: 'compact header'
  },
  {
    key: ConfigKey.HideFooter,
    label: 'Hide Footer'
  },
  {
    key: ConfigKey.HideRightSidebar,
    label: 'Hide Right Sidebar'
  },
  {
    key: ConfigKey.HideSupport,
    label: 'Hide Support'
  }
]

const createAppearanceMenuItem = ({
  key,
  label,
  restartDialogText,
  setMenuBarVisibility
}: AppearanceMenuItem): MenuItemConstructorOptions => ({
  label,
  type: 'checkbox',
  checked: config.get(key) as boolean,
  click({ checked }: { checked: boolean }) {
    config.set(key, checked)

    // If the style changes requires a restart, don't add or remove the class
    // name from the DOM
    if (restartDialogText) {
      showRestartDialog(checked, restartDialogText)
    } else {
      setCustomStyle(key, checked)
    }

    if (setMenuBarVisibility) {
      setAppMenuBarVisibility(true)
    }
  }
})

if (is.linux || is.windows) {
  appearanceMenuItems.unshift({
    key: ConfigKey.AutoHideMenuBar,
    label: 'Hide Menu bar',
    setMenuBarVisibility: true
  })
}

const applicationMenu: MenuItemConstructorOptions[] = [
  {
    label: APP_NAME,
    submenu: [
      {
        label: `About ${APP_NAME}`,
        role: 'about'
      },
      {
        label: 'Check for Updates...',
        click() {
          checkForUpdates()
        }
      },
      {
        type: 'separator'
      },
      {
        label: `Hide ${APP_NAME}`,
        accelerator: 'Cmd+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Cmd+Shift+H',
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
        label: `Quit ${APP_NAME}`,
        accelerator: 'Cmd+Q',
        click() {
          app.quit()
        }
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Appearance',
        submenu: [
          ...appearanceMenuItems.map(createAppearanceMenuItem),
          {
            label: 'Custom Styles',
            click() {
              // Create the custom style file if it doesn't exist
              if (!fs.existsSync(USER_CUSTOM_STYLE_PATH)) {
                fs.closeSync(fs.openSync(USER_CUSTOM_STYLE_PATH, 'w'))
              }

              shell.openItem(USER_CUSTOM_STYLE_PATH)
            }
          }
        ]
      },
      {
        label: 'Auto Update',
        type: 'checkbox',
        checked: config.get(ConfigKey.AutoUpdate),
        click({ checked }: { checked: boolean }) {
          config.set(ConfigKey.AutoUpdate, checked)
          showRestartDialog(checked, 'auto updates')
        }
      },
      {
        label: 'Launch minimized',
        type: 'checkbox',
        checked: config.get(ConfigKey.LaunchMinimized),
        click({ checked }: { checked: boolean }) {
          config.set(ConfigKey.LaunchMinimized, checked)
        }
      },
      {
        label: is.macos ? 'Enable Menu Bar Icon' : 'Enable System Tray Icon',
        type: 'checkbox',
        checked: config.get(ConfigKey.EnableTrayIcon),
        click({ checked }: { checked: boolean }) {
          config.set(ConfigKey.EnableTrayIcon, checked)
          showRestartDialog(
            checked,
            is.macos ? 'the menu bar icon' : 'the system tray icon'
          )
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
        label: 'Debug Mode',
        type: 'checkbox',
        checked: config.get(ConfigKey.DebugMode),
        click({ checked }) {
          config.set(ConfigKey.DebugMode, checked)
          showRestartDialog(checked, 'debug mode')
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo Typing',
        accelerator: 'Cmd+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+Cmd+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'Cmd+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'Cmd+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'Cmd+V',
        role: 'paste'
      },
      {
        label: 'Paste and Match Style',
        accelerator: 'Shift+Cmd+V',
        role: 'pasteAndMatchStyle'
      },
      {
        label: 'Select All',
        accelerator: 'Cmd+A',
        role: 'selectAll'
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'Cmd+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'Cmd+W',
        role: 'close'
      }
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: `${APP_NAME} Website`,
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
        visible: config.get(ConfigKey.DebugMode),
        click() {
          viewLogs()
        }
      }
    ]
  }
]

// Add the develop menu when running in the development environment
if (is.development) {
  applicationMenu.splice(-1, 0, {
    label: 'Develop',
    submenu: [
      {
        label: 'Clear Cache and Restart',
        click() {
          // Clear app config
          config.clear()
          // Restart without firing quitting events
          app.relaunch()
          app.exit(0)
        }
      }
    ]
  })
}

const menu = Menu.buildFromTemplate(applicationMenu)
export default menu
