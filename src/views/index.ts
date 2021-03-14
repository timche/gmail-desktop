import * as path from 'path'
import * as fs from 'fs'
import { BrowserView, BrowserWindow, app, dialog, shell } from 'electron'
import config, { ConfigKey } from '../config'
import {
  init as initCustomStyles,
  USER_CUSTOM_STYLE_PATH
} from './custom-styles'
import { autoFixUserAgent, removeCustomUserAgent } from '../user-agent'
import { platform } from '../helpers'
import { cleanURLFromGoogle, sendChannelToAllWindows } from '../utils'
import { getMainWindow } from '../app'

const TABS_HEIGHT = 40

const views: Record<string, BrowserView> = {}

export function getView(accountId: string) {
  return views[accountId]
}

export function getViews() {
  return Object.values(views)
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

export function getViewAccountId(viewId: number) {
  return Object.entries(views).find(
    ([_accountId, view]) => view.webContents.id === viewId
  )?.[0]
}

export function sendToSelectedView(channel: string, ...args: unknown[]) {
  const selectedAccount = config.get(ConfigKey.SelectedAccount)
  const selectedView = getView(selectedAccount)
  if (selectedView) {
    selectedView.webContents.send(channel, ...args)
  }
}

export function sendToViews(channel: string, ...args: unknown[]) {
  for (const view of Object.values(views)) {
    view.webContents.send(channel, ...args)
  }
}

export function selectView(mainWindow: BrowserWindow, accountId: string) {
  const view = getView(accountId)

  if (view) {
    mainWindow.setTopBrowserView(view)
    config.set(ConfigKey.SelectedAccount, accountId)
  }
}

export function offsetViews(withOffset: boolean) {
  const views = getViews()
  const mainWindow = getMainWindow()
  const { width, height } = mainWindow.getBounds()

  for (const view of views) {
    view.setBounds({
      x: 0,
      y: withOffset ? TABS_HEIGHT : 0,
      width,
      height: withOffset ? height - TABS_HEIGHT : height
    })
  }
}

export function createView(
  mainWindow: BrowserWindow,
  accountId: string,
  withOffset: boolean
) {
  const view = new BrowserView({
    webPreferences: {
      partition: accountId === 'default' ? undefined : `persist:${accountId}`,
      preload: path.join(__dirname, 'preload.js'),
      nativeWindowOpen: true
    }
  })

  views[accountId] = view

  mainWindow.addBrowserView(view)

  const { width, height } = mainWindow.getBounds()

  view.setBounds({
    x: 0,
    y: withOffset ? TABS_HEIGHT : 0,
    width,
    height: withOffset ? height - TABS_HEIGHT : height
  })

  mainWindow.on('resize', () => {
    view.setBounds({
      x: 0,
      y: TABS_HEIGHT,
      width: mainWindow.getBounds().width,
      height: mainWindow.getBounds().height - TABS_HEIGHT
    })
  })

  view.webContents.loadURL('https://mail.google.com')

  view.webContents.on('dom-ready', () => {
    addCustomCSS(view)
    initCustomStyles(view)
  })

  view.webContents.on('did-finish-load', async () => {
    if (view.webContents.getURL().includes('signin/rejected')) {
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

  // eslint-disable-next-line max-params
  view.webContents.on('new-window', (event: any, url, _1, _2, options) => {
    event.preventDefault()

    // `Add account` opens `accounts.google.com`
    if (url.startsWith('https://accounts.google.com')) {
      view.webContents.loadURL(url)
      return
    }

    if (url.startsWith('https://mail.google.com')) {
      mainWindow.setTopBrowserView(view)
      sendChannelToAllWindows('account-selected', accountId)
      config.set(ConfigKey.SelectedAccount, accountId)

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
  })
}
