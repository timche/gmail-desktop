import { app, shell, Menu, MenuItemConstructorOptions } from 'electron'
import { is } from 'electron-util'

import config from './config'
import { showRestartDialog } from './debug'
import { setMinimalMode } from './minimal-mode'

const APP_NAME = app.getName()

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
        label: 'Hide Others',
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
        label: 'Minimal Mode',
        type: 'checkbox',
        checked: config.get('minimalMode'),
        click({ checked }) {
          config.set('minimalMode', checked)
          setMinimalMode(checked)
        }
      },
      {
        label: 'Debug Mode',
        type: 'checkbox',
        checked: config.get('debugMode'),
        click({ checked }) {
          config.set('debugMode', checked)
          showRestartDialog(checked)
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

const menu = Menu.buildFromTemplate(darwinMenu)
export default menu
