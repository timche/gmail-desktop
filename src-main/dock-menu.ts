import { app, Menu } from 'electron'
import { is } from 'electron-util'
import config, { ConfigKey } from './config'
import { getMainWindow } from './main-window'
import { sendToSelectedView } from './account-views'
import { getAccountsMenuItems } from './accounts'

export function initOrUpdateDockMenu() {
  const mainWindow = getMainWindow()

  if (is.macos && mainWindow) {
    if (!config.get(ConfigKey.ShowDockIcon)) {
      app.dock.hide()
    }

    const dockMenu = Menu.buildFromTemplate([
      ...getAccountsMenuItems(),
      {
        type: 'separator'
      },
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
