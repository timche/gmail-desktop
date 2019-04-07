import { ipcRenderer as ipc } from 'electron'

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
})
