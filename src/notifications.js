const { Notification, ipcMain: ipc } = require('electron')

function init() {
  ipc.on('notification', (_, title, { body }) => {
    // Create the native Electron notification
    const notification = new Notification({
      body,
      title
    })

    // Immediately show the notification
    notification.show()
  })
}

module.exports = init
