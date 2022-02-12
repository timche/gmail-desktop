import { app, Menu } from 'electron'
import { is } from 'electron-util'
import config, { ConfigKey } from '../config'
import { showMainWindow } from '../main-window'
import { sendToSelectedAccountView } from '../account-views'
import { getAccountsMenuItems } from '../accounts'

export function initOrUpdateDockMenu() {
  if (is.macos) {
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
          showMainWindow()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Inbox',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'inbox')
          showMainWindow()
        }
      },
      {
        label: 'Important',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'imp')
          showMainWindow()
        }
      },
      {
        label: 'Snoozed',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'snoozed')
          showMainWindow()
        }
      },
      {
        label: 'Starred',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'starred')
          showMainWindow()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Drafts',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'drafts')
          showMainWindow()
        }
      },
      {
        label: 'Scheduled',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'scheduled')
          showMainWindow()
        }
      },
      {
        label: 'Sent',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'sent')
          showMainWindow()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'All Mail',
        click() {
          sendToSelectedAccountView('gmail:go-to', 'all')
          showMainWindow()
        }
      }
    ])

    app.dock.setMenu(dockMenu)
  }
}
