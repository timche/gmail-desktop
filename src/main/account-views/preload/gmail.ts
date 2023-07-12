import { ipcRenderer, IpcRendererEvent } from 'electron'
import elementReady from 'element-ready'
import { gmailUrl } from '../../../constants'
import { Mail } from '../../../types'
import {
  domParser,
  getContentBySelector,
  getDateBySelector,
  getNumberBySelector
} from '../../utils/dom'

declare global {
  interface Window {
    GM_INBOX_TYPE: 'CLASSIC' | 'SECTIONED'
  }
}

const mailActions = {
  archive: 'rc_^i',
  markAsRead: 'rd',
  delete: 'tr',
  markAsSpam: 'sp'
}

const inboxElementSelector = 'span > a[href*="#inbox"]'

let actionToken: string | undefined
let inboxParentElement: Element | undefined
let previousUnreadCount: number | undefined
let isInitialNewMailsFetch = true
let feedVersion = 0
let previousModifiedFeedDate = 0
let currentModifiedFeedDate = 0
let previousNewMails = new Set<string>()
let unreadCountObserver: MutationObserver | undefined

async function gmailRequest(
  path = '',
  fetchOptions?: Parameters<typeof fetch>[1]
) {
  return fetch(`${gmailUrl}${path}`, fetchOptions)
}

async function observeUnreadInbox() {
  await findInboxParentElement()

  if (inboxParentElement) {
    getUnreadInbox()
    unreadCountObserver = new MutationObserver(() => {
      getUnreadInbox()
    })
    unreadCountObserver.observe(inboxParentElement, { childList: true })
  }
}

async function fetchNewMails(sendUnreadCount?: boolean) {
  const isInboxSectioned = window.GM_INBOX_TYPE === 'SECTIONED'
  const label = isInboxSectioned ? '/^sq_ig_i_personal' : ''
  const version = ++feedVersion

  const feedDocument = await gmailRequest(`feed/atom${label}?v=${version}`)
    .then(async (response) => response.text())
    .then((xml) => domParser.parseFromString(xml, 'text/xml'))

  previousModifiedFeedDate = currentModifiedFeedDate
  currentModifiedFeedDate = getDateBySelector(feedDocument, 'modified')

  const isFeedModified = previousModifiedFeedDate !== currentModifiedFeedDate

  if (!isFeedModified) {
    return
  }

  if (sendUnreadCount) {
    const unreadCount = getNumberBySelector(feedDocument, 'fullcount')
    ipcRenderer.send('gmail:unread-count', unreadCount)
  }

  const newMails = parseNewMails(feedDocument)

  // Don't notify about new mails on first start
  if (isInitialNewMailsFetch) {
    isInitialNewMailsFetch = false
  } else {
    ipcRenderer.send('gmail:new-mails', newMails)
  }
}

async function sendMailAction(
  mailId: string,
  action: keyof typeof mailActions
) {
  await fetchActionToken()

  if (!actionToken) {
    throw new Error('Action token is missing')
  }

  const parameters = new URLSearchParams({
    t: mailId,
    at: actionToken,
    act: mailActions[action]
  }).toString()

  return gmailRequest(`?${parameters}`)
}

async function fetchActionToken() {
  if (!actionToken) {
    const gmailDocument = await gmailRequest().then(async (response) =>
      response.text()
    )

    actionToken = /var GM_ACTION_TOKEN="([\w-]+)";/.exec(gmailDocument)?.[1]
  }
}

function refreshInbox() {
  if (window.location.hash.startsWith('#inbox')) {
    const inboxElement = getInboxElement()
    if (inboxElement) {
      inboxElement.click()
    }
  }
}

async function findInboxParentElement() {
  const inboxElement = await elementReady(inboxElementSelector, {
    stopOnDomReady: false
  })

  inboxParentElement =
    inboxElement?.parentElement?.parentElement?.parentElement?.parentElement
      ?.parentElement?.parentElement ?? undefined
}

function getInboxElement() {
  return (
    document.querySelector<HTMLAnchorElement>(inboxElementSelector) ?? undefined
  )
}

function getUnreadInbox() {
  const inboxElement = getInboxElement()

  if (!inboxElement) {
    return
  }

  const unreadCountElement =
    inboxElement.parentElement?.parentElement?.querySelector('.bsU') ??
    undefined

  const currentUnreadCount = unreadCountElement?.textContent
    ? Number(unreadCountElement.textContent)
    : 0

  if (previousUnreadCount !== currentUnreadCount) {
    ipcRenderer.send('gmail:unread-count', currentUnreadCount)
    fetchNewMails()
    previousUnreadCount = currentUnreadCount
  }
}

function parseNewMails(feedDocument: Document) {
  const newMails: Mail[] = []
  const mails = feedDocument.querySelectorAll('entry')
  const currentDate = Date.now()

  for (const mail of mails) {
    const link = mail.querySelector('link')!.getAttribute('href')!
    const messageId = new URLSearchParams(link).get('message_id')!

    if (previousNewMails.has(messageId)) {
      continue
    }

    const issuedDate = getDateBySelector(mail, 'issued')

    if (currentDate - issuedDate < 60000) {
      previousNewMails.add(messageId)

      const newMail = {
        messageId,
        link,
        subject: getContentBySelector(mail, 'title'),
        summary: getContentBySelector(mail, 'summary').trim(),
        sender: {
          name: getContentBySelector(mail, 'name'),
          email: getContentBySelector(mail, 'email')
        }
      }

      newMails.push(newMail)
    }
  }

  return newMails
}

function clickElement(selector: string) {
  const element = document.querySelector<HTMLDivElement>(selector)
  if (element) {
    element.click()
  }
}

export function initGmail() {
  window.addEventListener('DOMContentLoaded', () => {
    observeUnreadInbox()

    ipcRenderer.on('gmail:archive-mail', async (_event, mailId: string) => {
      await sendMailAction(mailId, 'archive')
      refreshInbox()
    })

    ipcRenderer.on('gmail:mark-as-read', async (_event, mailId: string) => {
      await sendMailAction(mailId, 'markAsRead')
      refreshInbox()
    })

    ipcRenderer.on('gmail:delete-mail', async (_event, mailId: string) => {
      await sendMailAction(mailId, 'delete')
      refreshInbox()
    })

    ipcRenderer.on('gmail:mark-as-spam', async (_event, mailId: string) => {
      await sendMailAction(mailId, 'markAsSpam')
      refreshInbox()
    })

    ipcRenderer.on('gmail:go-to', (_event, destination: string) => {
      switch (destination) {
        case 'inbox':
        case 'starred':
        case 'snoozed':
        case 'sent':
        case 'drafts':
        case 'imp':
        case 'scheduled':
        case 'all':
        case 'settings':
          window.location.hash = `#${destination}`
          break
        default:
      }
    })

    ipcRenderer.on(
      'gmail:open-mail',
      (_event: IpcRendererEvent, messageId: string) => {
        window.location.hash = `#inbox/${messageId}`
      }
    )

    ipcRenderer.on(
      'gmail:compose-mail',
      async (_event, mailtoString?: string) => {
        if (!mailtoString) {
          return
        }

        // Decode mailto string
        const url = new URL(mailtoString)

        const to = decodeURIComponent(url.pathname)
        const parameters = new URLSearchParams(url.search)

        const cc = parameters.get('cc')
        const bcc = parameters.get('bcc')
        const subject = parameters.get('subject')
        const body = parameters.get('body')

        if (!to) {
          return
        }

        clickElement('div[gh="cm"]')

        const newMessageElement = await elementReady<HTMLTextAreaElement>(
          'div[aria-label="New Message"]:not([aria-checked])',
          {
            stopOnDomReady: false,
            timeout: 60000
          }
        )

        if (!newMessageElement) {
          return
        }

        newMessageElement.ariaChecked = 'true'

        const toDivElement = newMessageElement.querySelector<HTMLInputElement>(
          'div[name="to"]'
        )

        if (!toDivElement) {
          return
        }

        toDivElement.focus()
        await new Promise((resolve) => {
          setTimeout(resolve, 200)
        })

        const toElement = toDivElement.querySelector<HTMLInputElement>('input')
        if (!toElement) {
          return
        }

        toElement.focus()
        toElement.value = to

        if (cc) {
          const ccButtonElement = await elementReady<HTMLTextAreaElement>(
            'span[class="aB gQ pE"]',
            {
              target: newMessageElement,
              stopOnDomReady: false,
              timeout: 60000
            }
          )
          if (!ccButtonElement) {
            return
          }

          ccButtonElement.click()

          const ccElement = await elementReady<HTMLTextAreaElement>(
            'div[name="cc"] input',
            {
              target: newMessageElement,
              stopOnDomReady: false,
              timeout: 60000
            }
          )
          if (!ccElement) {
            return
          }

          ccElement.focus()
          ccElement.value = cc
        }

        if (bcc) {
          const bccButtonElement = await elementReady<HTMLTextAreaElement>(
            'span[class="aB  gQ pB"]',
            {
              target: newMessageElement,
              stopOnDomReady: false,
              timeout: 60000
            }
          )
          if (!bccButtonElement) {
            return
          }

          bccButtonElement.click()

          const bccElement = await elementReady<HTMLTextAreaElement>(
            'div[name="bcc"] input',
            {
              target: newMessageElement,
              stopOnDomReady: false,
              timeout: 60000
            }
          )
          if (!bccElement) {
            return
          }

          bccElement.focus()
          bccElement.value = bcc
        }

        const subjectElement = newMessageElement.querySelector<HTMLInputElement>(
          'input[name="subjectbox"]'
        )
        if (!subjectElement) {
          return
        }

        let subjectSet = false

        // The subject input can't be focused immediately after
        // settings the "to" input value for an unknown reason.
        setTimeout(() => {
          subjectElement.focus()
          if (subject) {
            subjectElement.value = subject
            subjectSet = true
          }
        }, 200)

        if (body || subjectSet) {
          const bodyElement = newMessageElement.querySelector<HTMLInputElement>(
            'div[role="textbox"]'
          )
          if (!bodyElement) {
            return
          }

          if (body) {
            bodyElement.focus()
            bodyElement.textContent = body
          }
        }
      }
    )

    setInterval(() => {
      previousNewMails.clear()
    }, 1000 * 60 * 30)
  })

  window.addEventListener('unload', () => {
    unreadCountObserver?.disconnect()
    unreadCountObserver = undefined

    actionToken = undefined
    inboxParentElement = undefined
    previousUnreadCount = undefined
    isInitialNewMailsFetch = true
    feedVersion = 0
    previousModifiedFeedDate = 0
    currentModifiedFeedDate = 0
    previousNewMails = new Set()
  })
}
