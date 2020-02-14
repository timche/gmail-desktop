import {
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  ipcRenderer as ipc
} from 'electron'

const baseGmailUrl = 'https://mail.google.com'

export function buildDockMenu(mainWindow: BrowserWindow): Menu {
  const inboxButton = createInboxButton()
  const composeButton = createComposeButton(mainWindow)
  const sentButton = createSentButton(mainWindow)
  return Menu.buildFromTemplate([inboxButton, composeButton, sentButton])
}

function createInboxButton(): MenuItemConstructorOptions {
  return {
    label: 'Inbox',
    click() {
      // TODO: investigate why ipc is undefined here
      ipc.send('open-inbox-view')
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
