import { ipcRenderer as ipc } from 'electron'

const UNREAD_INTERVAL = 1000
const ATTACH_BUTTON_INTERVAL = 200

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
  let buttonsFound = false

  const selectors = [
    'lR', // Archive
    'nN', // Spam
    'nX' // Delete
  ]

  // Close the new windows when specific action buttons are clicked
  selectors.forEach(selector => {
    // Scope the selector to only new windows
    const button = document.querySelector(`body.xE .G-atb .${selector}`)

    // Close the window when the button is clicked
    if (button) {
      button.addEventListener('click', () => window.close())
      buttonsFound = true
    }
  })

  // If the buttons were not found, sleep and then try again
  if (!buttonsFound) {
    setTimeout(attachButtonListeners, ATTACH_BUTTON_INTERVAL)
  }
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
  setInterval(updateUnreadCount, UNREAD_INTERVAL)

  // Wait for the page content to load before attaching the button listeners
  setTimeout(attachButtonListeners, ATTACH_BUTTON_INTERVAL)
})

// Toggle the minimal mode class when a message is
//   received from the main process
ipc.on('set-minimal-mode', (_: Event, enabled: boolean) => {
  document.body.classList[enabled ? 'add' : 'remove']('minimal-mode')
})
