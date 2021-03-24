import { ipcRenderer } from 'electron'
import { fetchGmailFeed } from './gmail-feed'
import elementReady from 'element-ready'

let inboxParentElement: Element | undefined
let previousUnreadCount: number | undefined

async function initInboxParentElement() {
  const inboxAnchorElement = await elementReady(
    'div[role=navigation] [href*="#inbox"]',
    {
      stopOnDomReady: false,
      timeout: 60000
    }
  )
  inboxParentElement =
    inboxAnchorElement?.parentElement?.parentElement?.parentElement
      ?.parentElement?.parentElement?.parentElement ?? undefined
}

async function getUnreadCount() {
  if (inboxParentElement) {
    const unreadCountElement: HTMLLabelElement | null = inboxParentElement.querySelector(
      '.bsU'
    )

    if (unreadCountElement?.textContent) {
      return Number(/\d*/.exec(unreadCountElement.textContent))
    }
  }

  return 0
}

async function updateUnreadCount() {
  const currentUnreadCount = await getUnreadCount()

  if (previousUnreadCount !== currentUnreadCount) {
    ipcRenderer.send('gmail:unread-count', currentUnreadCount)
    fetchGmailFeed()
    previousUnreadCount = currentUnreadCount
  }
}

export function initGmailInbox() {
  window.addEventListener('DOMContentLoaded', async () => {
    await initInboxParentElement()

    if (inboxParentElement) {
      updateUnreadCount()
      const observer = new MutationObserver(updateUnreadCount)
      observer.observe(inboxParentElement, { childList: true })
    }
  })
}
