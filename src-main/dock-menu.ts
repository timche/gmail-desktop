import { app, Menu } from 'electron'
import { is } from 'electron-util'
import config, { ConfigKey } from './config'
import { getMainWindow } from './main-window'
import { sendToSelectedAccountView } from './account-views'
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
          sendToSelectedAccountView('compose')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Inbox',
        click() {
          mainWindow.show()
          sendToSelectedAccountView('inbox')
        }
      },
      {
        label: 'Snoozed',
        click() {
          mainWindow.show()
          sendToSelectedAccountView('snoozed')
        }
      },
      {
        label: 'Sent',
        click() {
          mainWindow.show()
          sendToSelectedAccountView('sent')
        }
      },
      {
        label: 'All Mail',
        click() {
          mainWindow.show()
          sendToSelectedAccountView('all-mail')
        }
      }
    ])

    app.dock.setMenu(dockMenu)
  }
}
