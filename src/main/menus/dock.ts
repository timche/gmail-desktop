import { app, Menu } from 'electron'
import { is } from 'electron-util'
import config, { ConfigKey } from '../config'
import { getMainWindow } from '../main-window'
import { sendToSelectedAccountView } from '../account-views'
import { getAccountsMenuItems } from '../accounts'

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
          sendToSelectedAccountView('gmail:compose-mail')
          mainWindow.show()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Inbox',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'inbox')
          mainWindow.show()
        }
      },
      {
        label: 'Important',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'imp')
          mainWindow.show()
        }
      },
      {
        label: 'Snoozed',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'snoozed')
          mainWindow.show()
        }
      },
      {
        label: 'Starred',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'starred')
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
          mainWindow.show()
        }
      },
      {
        label: 'Scheduled',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'scheduled')
          mainWindow.show()
        }
      },
      {
        label: 'Sent',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'sent')
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
          mainWindow.show()
        }
      }
    ])

    app.dock.setMenu(dockMenu)
  }
}
