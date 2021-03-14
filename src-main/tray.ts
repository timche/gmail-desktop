import { app, Menu, MenuItemConstructorOptions, Tray } from 'electron'
import { is } from 'electron-util'
import config, { ConfigKey } from './config'
import { shouldStartMinimized } from './constants'
import { createTrayIcon } from './helpers'
import { getMainWindow } from './main-window'

let tray: Tray | undefined
let trayMenu: Menu

const trayIcon = createTrayIcon(false)
const trayIconUnread = createTrayIcon(true)

export function toggleAppVisiblityTrayItem(isMainWindowVisible: boolean): void {
  if (config.get(ConfigKey.EnableTrayIcon) && tray) {
    const showWin = trayMenu.getMenuItemById('show-win')
    if (showWin) {
      showWin.visible = !isMainWindowVisible
    }

    const hideWin = trayMenu.getMenuItemById('hide-win')
    if (hideWin) {
      hideWin.visible = isMainWindowVisible
    }

    tray.setContextMenu(trayMenu)
  }
}

export function updateTrayUnreadStatus(unreadCount: number) {
  if (tray) {
    tray.setImage(unreadCount ? trayIconUnread : trayIcon)

    if (is.macos) {
      tray.setTitle(unreadCount ? unreadCount.toString() : '')
    }
  }
}

export function getTrayMenuTemplate() {
  const macosMenuItems: MenuItemConstructorOptions[] = is.macos
    ? [
        {
          label: 'Show Dock Icon',
          type: 'checkbox',
          checked: config.get(ConfigKey.ShowDockIcon),
          click({ checked }: { checked: boolean }) {
            config.set(ConfigKey.ShowDockIcon, checked)

            if (checked) {
              app.dock.show()
            } else {
              app.dock.hide()
            }

            const menu = trayMenu.getMenuItemById('menu')

            if (menu) {
              menu.visible = !checked
            }
          }
        },
        {
          type: 'separator'
        },
        {
          id: 'menu',
          label: 'Menu',
          visible: !config.get(ConfigKey.ShowDockIcon),
          submenu: Menu.getApplicationMenu()!
        }
      ]
    : []

  const trayMenuTemplate: MenuItemConstructorOptions[] = [
    {
      click: () => {
        getMainWindow().show()
      },
      label: 'Show',
      visible: shouldStartMinimized,
      id: 'show-win'
    },
    {
      label: 'Hide',
      visible: !shouldStartMinimized,
      click: () => {
        getMainWindow().hide()
      },
      id: 'hide-win'
    },
    ...macosMenuItems,
    {
      type: 'separator'
    },
    {
      role: 'quit'
    }
  ]

  return trayMenuTemplate
}

export function initTray() {
  if (!config.get(ConfigKey.EnableTrayIcon)) {
    return
  }

  tray = new Tray(trayIcon)

  tray.setToolTip(app.name)

  trayMenu = Menu.buildFromTemplate(getTrayMenuTemplate())
  tray.setContextMenu(trayMenu)

  tray.on('click', () => {
    const mainWindow = getMainWindow()
    if (mainWindow) {
      mainWindow.show()
    }
  })
}
