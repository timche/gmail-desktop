import { ipcRenderer as ipc } from 'electron'
import log from 'electron-log'

import { ConfigKey } from './config'

import elementReady = require('element-ready')

const INTERVAL = 1000
let count: number

function getUnreadCount(): number {
  // Find the number next to the inbox label
  const navigation = document.querySelector(
    'div[role=navigation] [href*="#inbox"]'
  )

  if (navigation) {
    const label: HTMLLabelElement | null = navigation.parentElement!.parentElement!.querySelector(
      '.bsU'
    )

    // Return the unread count (0 by default)
    if (label) {
      return Number(/\d*/.exec(label.innerText))
    }
  }

  return 0
}

function updateUnreadCount(): void {
  const newCount = getUnreadCount()

  // Only fire the event when necessary
  if (count !== newCount) {
    ipc.send('unread-count', newCount)
    count = newCount
  }
}

function attachButtonListeners(): void {
  // For windows that won't include the selectors we are expecting,
  //   don't wait for them appear as they never will
  if (!window.location.search.includes('&search=inbox')) {
    return
  }

  const selectors = [
    'lR', // Archive
    'nX' // Delete
  ]

  selectors.forEach(selector => {
    const buttonReady = elementReady(`body.xE .G-atb .${selector}`)
    const readyTimeout = setTimeout(() => buttonReady.stop(), 10000)

    buttonReady.then(button => {
      clearTimeout(readyTimeout)

      if (button) {
        button.addEventListener('click', () => window.close())
      } else {
        log.error(`Detect button "${selector}" timed out`)
      }
    })
  })
}

window.addEventListener('load', () => {
  // Set the initial unread count
  updateUnreadCount()

  // Listen to changes to the document title
  const title = document.querySelector('title')

  if (title) {
    const observer = new MutationObserver(updateUnreadCount)
    observer.observe(title, { childList: true })
  }

  // Check the unread count on an interval timer for instances where
  //   the title doesn't change
  setInterval(updateUnreadCount, INTERVAL)

  // Attaching the button listeners to the buttons
  //   that should close the new window
  attachButtonListeners()
})

// Toggle a custom style class when a message is received from the main process
ipc.on('set-custom-style', (_: Event, key: ConfigKey, enabled: boolean) => {
  document.body.classList[enabled ? 'add' : 'remove'](key)
})

// Toggle a full screen class when a message is received from the main process
ipc.on('set-full-screen', (_: Event, enabled: boolean) => {
  document.body.classList[enabled ? 'add' : 'remove']('full-screen')
})
