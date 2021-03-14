import { app, Menu } from 'electron'
import { is } from 'electron-util'
import config, { ConfigKey } from './config'
import { getMainWindow } from './main-window'
import { sendToSelectedView } from './account-views'

export function initDock() {
  const mainWindow = getMainWindow()

  if (is.macos && mainWindow) {
    if (!config.get(ConfigKey.ShowDockIcon)) {
      app.dock.hide()
    }

    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'Compose',
        click() {
          mainWindow.show()
          sendToSelectedView('compose')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Inbox',
        click() {
          mainWindow.show()
          sendToSelectedView('inbox')
        }
      },
      {
        label: 'Snoozed',
        click() {
          mainWindow.show()
          sendToSelectedView('snoozed')
        }
      },
      {
        label: 'Sent',
        click() {
          mainWindow.show()
          sendToSelectedView('sent')
        }
      },
      {
        label: 'All Mail',
        click() {
          mainWindow.show()
          sendToSelectedView('all-mail')
        }
      }
    ])

    app.dock.setMenu(dockMenu)
  }
}
