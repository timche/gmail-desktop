import { app, shell, Menu, MenuItemConstructorOptions } from 'electron'
import * as appConfig from 'electron-settings'
import { is } from 'electron-util'

import { CONFIG_KEY as DEBUG_MODE_CONFIG_KEY, showRestartDialog } from './debug'

const APP_NAME = app.getName()
let mailtoStatus = app.isDefaultProtocolClient('mailto')

function toggleMailto(): void {
  if (app.isDefaultProtocolClient('mailto')) {
    app.removeAsDefaultProtocolClient('mailto')
    mailtoStatus = false
  } else {
    app.setAsDefaultProtocolClient('mailto')
    mailtoStatus = true
  }
}

const debugMode = !!appConfig.get(DEBUG_MODE_CONFIG_KEY)
function toggleDebugMode(): void {
  const enabled = !debugMode

  appConfig.set(DEBUG_MODE_CONFIG_KEY, enabled)
  showRestartDialog(enabled)
}

const darwinMenu: MenuItemConstructorOptions[] = [
  {
    label: APP_NAME,
    submenu: [
      {
        label: `About ${APP_NAME}`,
        role: 'about'
      },
      {
        label: `Hide ${APP_NAME}`,
        accelerator: 'Cmd+H',
        role: 'hide'
      },
      {
        label: 'Hide others',
        accelerator: 'Cmd+Shift+H',
        role: 'hideothers'
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
        label: 'Default Mailto Client',
        type: 'checkbox',
        checked: mailtoStatus,
        click() {
          toggleMailto()
        }
      },
      {
        label: 'Debug Mode',
        type: 'checkbox',
        checked: debugMode,
        click() {
          toggleDebugMode()
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
        label: 'Select All',
        accelerator: 'Cmd+A',
        role: 'selectall'
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
        label: 'Report an issue',
        click() {
          shell.openExternal(
            'https://github.com/timche/gmail-desktop/issues/new/choose'
          )
        }
      }
    ]
  }
]

// Add the develop menu when running in the development environment
if (is.development) {
  darwinMenu.splice(-1, 0, {
    label: 'Develop',
    submenu: [
      {
        label: 'Clear cache and restart',
        click() {
          // Clear app config
          appConfig.deleteAll()
          // Restart without firing quitting events
          app.relaunch()
          app.exit(0)
        }
      }
    ]
  })
}

const menu = Menu.buildFromTemplate(darwinMenu)
export default menu
