import { ipcRenderer as ipc } from 'electron'
import elementReady from 'element-ready'
import log from 'electron-log'

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
      return Number(label.innerText.match(/\d/))
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
  // if (!window.location.search.includes('&search=inbox')) {
  //   return
  // }

  const promise = elementReady('body.xE .G-atb .lR')

  promise
    .then(() => {
      const selectors = [
        'lR', // Archive
        'nX' // Delete
      ]

      // Close the new windows when specific action buttons are clicked
      selectors.forEach(selector => {
        // Scope the selector to only new windows
        const button = document.querySelector(`body.xE .G-atb .${selector}`)

        // Close the window when the button is clicked
        if (button) {
          button.addEventListener('click', () => window.close())
        }
      })
    })
    .catch(log.warn)

  // Cancel the element-ready promise after 10 seconds to prevent
  //   a possible runaway check loop
  setTimeout(() => {
    promise.cancel('Canceling runaway element-ready check loop')
  }, 10000)
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

// Toggle the minimal mode class when a message is
//   received from the main process
ipc.on('set-minimal-mode', (_: Event, enabled: boolean) => {
  document.body.classList[enabled ? 'add' : 'remove']('minimal-mode')
})
