const { Notification, ipcMain: ipc } = require('electron')

/**
 * Opens the email referenced in the notification
 * @todo
 */
// function openEmail() {
// }

function init() {
  ipc.on('notification', (_, title, { body }) => {
    // Create the native Electron notification
    const notification = new Notification({
      actions: [
        {
          type: 'button',
          text: 'Open'
        }
      ],
      body,
      title
    })

    // Immediately show the notification
    notification.show()

    // Open the email when the notification is clicked
    // notification.on('click', openEmail)

    // Open the email when the "Open" action is clicked
    // notification.on('action', (_, index) => index === 0 && openEmail())
  })
}

module.exports = init
