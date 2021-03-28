import * as path from 'path'
import { BrowserView, BrowserWindow, app, dialog, session } from 'electron'
import { addCustomCSS, initCustomStyles } from './custom-styles'
import { enableAutoFixUserAgent } from '../user-agent'
import { getMainWindow, sendToMainWindow } from '../main-window'
import {
  getSelectedAccount,
  isDefaultAccount,
  selectAccount
} from '../accounts'
import { TOP_ELEMENT_HEIGHT, GMAIL_URL } from '../constants'
import { is } from 'electron-util'
import { addContextMenu } from './context-menu'
import { getIsUpdateAvailable } from '../updates'
import { openExternalUrl } from '../helpers'
import config, { ConfigKey } from '../config'

const accountViews = new Map<string, BrowserView>()

export function getAccountView(accountId: string) {
  const accountView = accountViews.get(accountId)
  if (!accountView) {
    throw new Error('Account view is unitialized or has been destroyed')
  }

  return accountView
}

export function getAccountIdByViewId(accountViewId: number) {
  for (const [accountId, accountView] of accountViews) {
    if (accountView.webContents.id === accountViewId) {
      return accountId
    }
  }

  return undefined
}

export function sendToSelectedAccountView(channel: string, ...args: unknown[]) {
  const selectedAccount = getSelectedAccount()
  if (selectedAccount) {
    const selectedView = getAccountView(selectedAccount.id)
    selectedView.webContents.send(channel, ...args)
  }
}

export function sendToAccountViews(channel: string, ...args: unknown[]) {
  for (const [_accountId, accountView] of accountViews) {
    accountView.webContents.send(channel, ...args)
  }
}

export function selectAccountView(accountId: string) {
  const accountView = getAccountView(accountId)
  const mainWindow = getMainWindow()

  mainWindow.setTopBrowserView(accountView)
  accountView.webContents.focus()
  accountView.webContents.send('account-selected')
}

export function forEachAccountView(
  callback: (accountView: BrowserView) => void
) {
  for (const [_accountId, accountView] of accountViews) {
    callback(accountView)
  }
}

export function updateAccountViewBounds(accountView: BrowserView) {
  const hasMultipleAccounts = accountViews.size > 1
  const isUpdateAvailable = getIsUpdateAvailable()
  const { width, height } = getMainWindow().getBounds()

  let offset =
    is.macos || config.get(ConfigKey.TitleBarStyle) === 'system' ? 0 : 30 // Linux/Window Title Bar

  if (hasMultipleAccounts) {
    offset += TOP_ELEMENT_HEIGHT
  }

  if (isUpdateAvailable) {
    offset += TOP_ELEMENT_HEIGHT
  }

  accountView.setBounds({
    x: 0,
    y: offset || 0,
    width,
    height: offset ? height - offset : height
  })

  accountView.webContents.send(
    'burger-menu-offset',
    is.macos && !isUpdateAvailable && !hasMultipleAccounts
  )
}

export function updateAllAccountViewBounds() {
  for (const [_accountId, accountView] of accountViews) {
    updateAccountViewBounds(accountView)
  }
}

export function removeAccountView(accountId: string) {
  const accountView = getAccountView(accountId)
  const mainWindow = getMainWindow()

  mainWindow.removeBrowserView(accountView)
  // `browserView.webContents.destroy()` is undocumented:
  // https://github.com/electron/electron/issues/10096#issuecomment-774505246
  // @ts-expect-error
  accountView.webContents.destroy()
  session.fromPartition(`persist:${accountId}`).clearStorageData()
  accountViews.delete(accountId)

  updateAllAccountViewBounds()
}

export function hideAccountViews() {
  const mainWindow = getMainWindow()

  for (const [_accountId, accountView] of accountViews) {
    mainWindow.removeBrowserView(accountView)
  }
}

export function showAccountViews() {
  const mainWindow = getMainWindow()

  for (const [_accountId, accountView] of accountViews) {
    mainWindow.addBrowserView(accountView)
  }

  const selectedAccount = getSelectedAccount()

  if (selectedAccount) {
    selectAccountView(selectedAccount.id)
  }
}

export function getSelectedAccountView() {
  const selectedAccount = getSelectedAccount()
  if (!selectedAccount) {
    return
  }

  return accountViews.get(selectedAccount.id)
}

export function getSessionPartitionKey(accountId: string) {
  return isDefaultAccount(accountId) ? undefined : `persist:${accountId}`
}

export function createAccountView(accountId: string, setAsTopView?: boolean) {
  const sessionPartitionKey = getSessionPartitionKey(accountId)
  const accountSession = sessionPartitionKey
    ? session.fromPartition(sessionPartitionKey)
    : session.defaultSession

  accountSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      if (permission === 'notifications') {
        callback(false)
      }
    }
  )

  const accountView = new BrowserView({
    webPreferences: {
      partition: sessionPartitionKey,
      preload: path.join(__dirname, 'preload', 'account-view.js'),
      nativeWindowOpen: true
    }
  })

  accountViews.set(accountId, accountView)

  const mainWindow = getMainWindow()

  mainWindow.addBrowserView(accountView)

  if (setAsTopView) {
    mainWindow.setTopBrowserView(accountView)
  }

  addContextMenu(accountView)

  accountView.webContents.loadURL(GMAIL_URL)

  accountView.webContents.on('dom-ready', () => {
    addCustomCSS(accountView)
    initCustomStyles(accountView)
  })

  accountView.webContents.on('did-finish-load', async () => {
    if (accountView.webContents.getURL().includes('signin/rejected')) {
      const { response } = await dialog.showMessageBox({
        type: 'info',
        message: `It looks like you are unable to sign-in, because Gmail is blocking the user agent ${app.name} is using.`,
        detail: `Do you want ${app.name} to attempt to fix it automatically? If that doesn't work, you can try to set another user agent yourself or ask for help (see "Troubleshoot").`,
        buttons: ['Yes', 'Cancel', 'Troubleshoot']
      })

      if (response === 2) {
        openExternalUrl(
          'https://github.com/timche/gmail-desktop#i-cant-sign-in-this-browser-or-app-may-not-be-secure'
        )
        return
      }

      if (response === 1) {
        return
      }

      enableAutoFixUserAgent()
    }
  })

  accountView.webContents.on('will-redirect', (event, url) => {
    // Sometimes Gmail is redirecting to the landing page instead of login.
    if (url.startsWith('https://www.google.com')) {
      event.preventDefault()
      accountView.webContents.loadURL(
        'https://accounts.google.com/ServiceLogin?service=mail'
      )
    }
  })

  accountView.webContents.on(
    'new-window',
    // eslint-disable-next-line max-params
    (event: any, url, _1, _2, options) => {
      event.preventDefault()

      // `Add account` opens `accounts.google.com`
      if (url.startsWith('https://accounts.google.com')) {
        sendToMainWindow('add-account-request')
        hideAccountViews()
        return
      }

      if (url.startsWith(GMAIL_URL)) {
        selectAccount(accountId)

        // // Center the new window on the screen
        event.newGuest = new BrowserWindow({
          ...options,
          titleBarStyle: 'default',
          x: undefined,
          y: undefined
        })

        event.newGuest.webContents.on('dom-ready', () => {
          addCustomCSS(event.newGuest)
        })

        event.newGuest.webContents.on(
          'new-window',
          (event: Event, url: string) => {
            event.preventDefault()
            openExternalUrl(url)
          }
        )

        return
      }

      if (url.startsWith('about:blank')) {
        const win = new BrowserWindow({
          ...options,
          show: false
        })

        win.webContents.once('will-redirect', (_event, url) => {
          openExternalUrl(url)
          win.destroy()
        })

        event.newGuest = win

        return
      }

      openExternalUrl(url)
    }
  )
}
