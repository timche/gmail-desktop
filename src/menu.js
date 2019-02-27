const { app, shell, Menu } = require('electron')
const appConfig = require('electron-settings')
const { is } = require('electron-util')

const APP_NAME = app.getName()
let mailtoStatus = app.isDefaultProtocolClient('mailto')

function toggleMailto() {
  if (app.isDefaultProtocolClient('mailto')) {
    app.removeAsDefaultProtocolClient('mailto')
    mailtoStatus = false
  } else {
    app.setAsDefaultProtocolClient('mailto')
    mailtoStatus = true
  }
}

const darwinMenu = [
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
            'https://github.com/timche/gmail-desktop/issues/new'
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

module.exports = Menu.buildFromTemplate(darwinMenu)
