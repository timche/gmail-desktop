import { Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron'

const baseGmailUrl = 'https://mail.google.com'

export function buildDockMenu(mainWindow: BrowserWindow): Menu {
  const inboxButton = createInboxButton(mainWindow)
  const composeButton = createComposeButton(mainWindow)
  const sentButton = createSentButton(mainWindow)
  return Menu.buildFromTemplate([inboxButton, composeButton, sentButton])
}

function createInboxButton(
  mainWindow: BrowserWindow
): MenuItemConstructorOptions {
  return {
    label: 'Inbox',
    async click() {
      await mainWindow.loadURL(`${baseGmailUrl}/#inbox`)
      mainWindow.show()
    }
  }
}

function createComposeButton(
  mainWindow: BrowserWindow
): MenuItemConstructorOptions {
  return {
    label: 'Compose',
    async click() {
      await mainWindow.loadURL(`${baseGmailUrl}/#inbox?compose=new`)
      mainWindow.show()
    }
  }
}

function createSentButton(
  mainWindow: BrowserWindow
): MenuItemConstructorOptions {
  return {
    label: 'Sent',
    async click() {
      await mainWindow.loadURL(`${baseGmailUrl}/#sent`)
      mainWindow.show()
    }
  }
}
