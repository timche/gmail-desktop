import * as path from 'path'
import * as fs from 'fs'
import {
  BrowserView,
  BrowserWindow,
  app,
  dialog,
  shell,
  session
} from 'electron'
import config, { ConfigKey } from '../config'
import {
  init as initCustomStyles,
  USER_CUSTOM_STYLE_PATH
} from './custom-styles'
import { autoFixUserAgent, removeCustomUserAgent } from '../user-agent'
import { platform } from '../helpers'
import { cleanURLFromGoogle } from '../utils'
import { getMainWindow } from '../main-window'
import { getSelectedAccount, selectAccount } from '../accounts'
import { ACCOUNTS_TAB_HEIGHT, GMAIL_URL } from '../constants'
import { is } from 'electron-util'

const accountViews = new Map<string, BrowserView>()

export function getAccountView(accountId: string) {
  return accountViews.get(accountId)
}

export function getAccountIdByViewId(accountViewId: number) {
  for (const [accountId, accountView] of accountViews) {
    if (accountView.webContents.id === accountViewId) {
      return accountId
    }
  }

  return undefined
}

export function sendToSelectedView(channel: string, ...args: unknown[]) {
  const selectedAccount = getSelectedAccount()
  if (selectedAccount) {
    const selectedView = getAccountView(selectedAccount.id)
    if (selectedView) {
      selectedView.webContents.send(channel, ...args)
    }
  }
}

export function sendToAccountViews(channel: string, ...args: unknown[]) {
  for (const [_accountId, accountView] of accountViews) {
    accountView.webContents.send(channel, ...args)
  }
}

export function selectAccountView(accountId: string) {
  const accountView = getAccountView(accountId)
  if (accountView) {
    getMainWindow().setTopBrowserView(accountView)
  }
}

export function updateAllAccountViewBounds() {
  for (const [_accountId, accountView] of accountViews) {
    updateAccountViewBounds(accountView)
  }

  sendToAccountViews('burger-menu-offset', is.macos && accountViews.size === 1)
}

export function updateAccountViewBounds(accountView: BrowserView) {
  const shouldAccountViewOffset = getShouldAccountViewOffset()
  const { width, height } = getMainWindow().getBounds()

  accountView.setBounds({
    x: 0,
    y: shouldAccountViewOffset ? ACCOUNTS_TAB_HEIGHT : 0,
    width,
    height: shouldAccountViewOffset ? height - ACCOUNTS_TAB_HEIGHT : height
  })
}

export function removeAccountView(accountId: string) {
  const accountView = getAccountView(accountId)
  const mainWindow = getMainWindow()

  if (accountView) {
    mainWindow.removeBrowserView(accountView)
    // `browserView.webContents.destroy()` is undocumented:
    // https://github.com/electron/electron/issues/10096#issuecomment-774505246
    // @ts-expect-error
    accountView.webContents.destroy()
    session.fromPartition(`persist:${accountId}`).clearStorageData()
    accountViews.delete(accountId)

    updateAllAccountViewBounds()
  }
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

export function getShouldAccountViewOffset() {
  return accountViews.size > 1
}

function addCustomCSS(view: BrowserView): void {
  view.webContents.insertCSS(
    fs.readFileSync(
      path.join(__dirname, '..', '..', 'css', 'style.css'),
      'utf8'
    )
  )

  if (fs.existsSync(USER_CUSTOM_STYLE_PATH)) {
    view.webContents.insertCSS(fs.readFileSync(USER_CUSTOM_STYLE_PATH, 'utf8'))
  }

  const platformCSSFile = path.join(
    __dirname,
    '..',
    '..',
    'css',
    `style.${platform}.css`
  )
  if (fs.existsSync(platformCSSFile)) {
    view.webContents.insertCSS(fs.readFileSync(platformCSSFile, 'utf8'))
  }
}

async function openExternalUrl(url: string): Promise<void> {
  const cleanURL = cleanURLFromGoogle(url)

  if (config.get(ConfigKey.ConfirmExternalLinks)) {
    const { origin } = new URL(cleanURL)
    const trustedHosts = config.get(ConfigKey.TrustedHosts)

    if (!trustedHosts.includes(origin)) {
      const { response, checkboxChecked } = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Open Link', 'Cancel'],
        message: `Do you want to open this external link in your default browser?`,
        checkboxLabel: `Trust all links on ${origin}`,
        detail: cleanURL
      })

      if (response !== 0) return

      if (checkboxChecked) {
        config.set(ConfigKey.TrustedHosts, [...trustedHosts, origin])
      }
    }
  }

  shell.openExternal(cleanURL)
}

export function getSelectedAccountView() {
  const selectedAccount = getSelectedAccount()
  if (!selectedAccount) {
    return
  }

  return accountViews.get(selectedAccount.id)
}

export function createAccountView(accountId: string, setAsTopView?: boolean) {
  const accountView = new BrowserView({
    webPreferences: {
      partition: accountId === 'default' ? undefined : `persist:${accountId}`,
      preload: path.join(__dirname, 'preload.js'),
      nativeWindowOpen: true
    }
  })

  accountViews.set(accountId, accountView)

  const mainWindow = getMainWindow()

  mainWindow.addBrowserView(accountView)

  if (setAsTopView) {
    mainWindow.setTopBrowserView(accountView)
  }

  mainWindow.on('resize', () => {
    updateAccountViewBounds(accountView)
  })

  accountView.webContents.loadURL(GMAIL_URL)

  accountView.webContents.on('dom-ready', () => {
    addCustomCSS(accountView)
    initCustomStyles(accountView)
  })

  accountView.webContents.on('did-finish-load', async () => {
    if (accountView.webContents.getURL().includes('signin/rejected')) {
      const message = `It looks like you are unable to sign-in, because Gmail is blocking the user agent ${app.name} is using.`
      const askAutoFixMessage = `Do you want ${app.name} to attempt to fix it automatically?`
      const troubleshoot = () => {
        openExternalUrl(
          'https://github.com/timche/gmail-desktop#i-cant-sign-in-this-browser-or-app-may-not-be-secure'
        )
      }

      if (config.get(ConfigKey.CustomUserAgent)) {
        const { response } = await dialog.showMessageBox({
          type: 'info',
          message,
          detail: `You're currently using a custom user agent. ${askAutoFixMessage} Alternatively you can try the default user agent or set another custom user agent (see "Troubleshoot").`,
          buttons: ['Yes', 'Cancel', 'Use Default User Agent', 'Troubleshoot']
        })

        if (response === 3) {
          troubleshoot()
          return
        }

        if (response === 2) {
          removeCustomUserAgent()
          return
        }

        if (response === 1) {
          return
        }

        return
      }

      const { response } = await dialog.showMessageBox({
        type: 'info',
        message,
        detail: `${askAutoFixMessage} Alternatively you can set a custom user agent (see "Troubleshoot").`,
        buttons: ['Yes', 'Cancel', 'Troubleshoot']
      })

      if (response === 2) {
        troubleshoot()
        return
      }

      if (response === 1) {
        return
      }

      autoFixUserAgent()
    }
  })

  accountView.webContents.on(
    'new-window',
    // eslint-disable-next-line max-params
    (event: any, url, _1, _2, options) => {
      event.preventDefault()

      // `Add account` opens `accounts.google.com`
      if (url.startsWith('https://accounts.google.com')) {
        accountView.webContents.loadURL(url)
        return
      }

      if (url.startsWith('https://mail.google.com')) {
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
