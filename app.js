import { app, shell, BrowserWindow, Menu } from 'electron'
import menu from './menu'

let mainWindow
let isQuitting = false

let isAlreadyRunning = app.makeSingleInstance(() => {
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

function updateBadge (title) {
  let unreadCount = (/^.+\s\((\d+)\)/).exec(title)

  app.dock.setBadge(unreadCount ? unreadCount[1] : '')
}

function createWindow () {
  mainWindow = new BrowserWindow({
    title: app.getName(),
    width: 1280,
    height: 960,
    titleBarStyle: 'hidden-inset'
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

app.on('ready', () => {
  createWindow()

  Menu.setApplicationMenu(menu)

  let {webContents} = mainWindow

  webContents.on('dom-ready', () => {
    mainWindow.show()
  })

  webContents.on('new-window', (e, url) => {
    if (/^(https:\/\/mail\.google\.com).*/.test(url)) {
      e.preventDefault()
      mainWindow.loadURL(url)
    } else {
        e.preventDefault()
        shell.openExternal(url)
    }
  })
})

app.on('activate', function () {
  mainWindow.show()
})

app.on('before-quit', () => {
  isQuitting = true
})
