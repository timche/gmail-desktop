import { ipcRenderer } from 'electron'
import { fetchGmailFeed } from './feed'
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

export function refreshInbox(forceRefresh?: true) {
  if (window.location.hash.startsWith('#inbox') || forceRefresh) {
    const inboxAnchorElement = document.querySelector<HTMLAnchorElement>(
      'a[href*="#inbox"]'
    )
    if (inboxAnchorElement) {
      inboxAnchorElement.click()
    }
  }
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

export function handleGmailInbox() {
  ipcRenderer.on('gmail:open-mail', async (_event, messageId: string) => {
    const threadElementSelector = `[data-legacy-thread-id="${messageId}"]`

    const threadElement = document.querySelector<HTMLSpanElement>(
      threadElementSelector
    )

    if (!threadElement) {
      refreshInbox(true)
      await elementReady<HTMLSpanElement>(threadElementSelector, {
        timeout: 30000
      })
    }

    if (threadElement) {
      threadElement.click()
    }
  })

  window.addEventListener('DOMContentLoaded', async () => {
    await initInboxParentElement()

    if (inboxParentElement) {
      updateUnreadCount()
      const observer = new MutationObserver(updateUnreadCount)
      observer.observe(inboxParentElement, { childList: true })
    }
  })
}
