/* eslint-env browser */

const { ipcRenderer: ipc } = require('electron')

const INTERVAL = 1000
let count

function getUnreadCount() {
  // Find the number next to the inbox label
  const label = document
    .querySelector('div[role=navigation] [href*="#inbox"]')
    .parentElement.parentElement.querySelector('.bsU')

  // Return the unread count (0 by default)
  return label ? Number(label.innerText.match(/\d/)) : 0
}

function updateUnreadCount() {
  const newCount = getUnreadCount()

  // Only fire the event when necessary
  if (count !== newCount) {
    ipc.send('unread-count', newCount)
    count = newCount
  }
}

window.addEventListener('load', () => {
  // Set the initial unread count
  updateUnreadCount()

  // Listen to changes to the document title
  const observer = new MutationObserver(updateUnreadCount)
  observer.observe(document.querySelector('title'), { childList: true })

  // Check the unread count on an interval timer for instances where
  //   the title doesn't change
  setInterval(updateUnreadCount, INTERVAL)
})

// Send notifications to the Electron app for better control
class CapturedNotification {
  constructor(...args) {
    ipc.send('notification', ...args)
  }
}

// Always grant notification permissions
CapturedNotification.permission = 'granted'
window.Notification = CapturedNotification
