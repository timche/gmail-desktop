/* eslint-disable import/no-unresolved */
import { app, shell, BrowserWindow, Menu } from 'electron'
/* eslint-enable import/no-unresolved */
import menu from './menu'

let mainWindow
let replyToWindow
let isQuitting = false

const isAlreadyRunning = app.makeSingleInstance(() => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.show()
  }
})

if (isAlreadyRunning) {
  app.quit()
}

function updateBadge(title) {
  const unreadCount = (/^.+\s\((\d+[,]?\d+)\)/).exec(title)

  app.dock.setBadge(unreadCount ? unreadCount[1] : '')
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: app.getName(),
    width: 1280,
    height: 960,
    titleBarStyle: 'hidden-inset',
    webPreferences: {
      nodeIntegration: false
    }
  })

  mainWindow.loadURL('https://mail.google.com')

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      app.hide()
    }
  })

  mainWindow.on('page-title-updated', (e, title) => updateBadge(title))
}

function createMailTo(url) {
  replyToWindow = new BrowserWindow({
    parent: mainWindow
  })

  replyToWindow.loadURL(`https://mail.google.com/mail/?extsrc=mailto&url=${url}`)
}

app.on('ready', () => {
  createWindow()
  Menu.setApplicationMenu(menu)

  const { webContents } = mainWindow

  webContents.on('dom-ready', () => {
    mainWindow.show()
  })

  webContents.on('new-window', (e, url) => {
    if (/^(https:\/\/(mail|accounts)\.google\.com).*/.test(url)) {
      e.preventDefault()
      mainWindow.loadURL(url)
    } else {
      e.preventDefault()
      shell.openExternal(url)
    }
  })
})

app.on('open-url', (event, url) => {
  event.preventDefault()
  createMailTo(url)
})

app.on('activate', () => {
  mainWindow.show()
})

app.on('before-quit', () => {
  isQuitting = true
})
