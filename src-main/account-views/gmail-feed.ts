import { ipcRenderer } from 'electron'
import { fetchGmail } from './gmail-actions'

const parser = new DOMParser()

export interface Mail {
  messageId: string
  subject: string
  summary: string
  link: string
  senderName: string
  senderEmail: string
}

let isInitialFeed = true
let previousModifiedDate = 0
let currentModifiedDate = 0
const previousNewMails = new Set<string>()

function parseAtomToDocument(xml: string) {
  return parser.parseFromString(xml, 'text/xml')
}

function getTextContent(node: Document | Element, selector: string) {
  return node.querySelector(selector)?.textContent ?? ''
}

export function getDate(node: Document | Element, selector: string) {
  return new Date(getTextContent(node, selector)).getTime()
}

export function getUnreadCount(feedDocument: Document) {
  const unreadCount = getTextContent(feedDocument, 'fullcount')
  return unreadCount ? Number(unreadCount) : 0
}

export function updateModifiedDates(feedDocument: Document) {
  previousModifiedDate = currentModifiedDate
  currentModifiedDate = getDate(feedDocument, 'modified')
}

export function getNewMails(feedDocument: Document) {
  const newMails: Mail[] = []

  const mails = feedDocument.querySelectorAll('entry')

  for (const mail of mails) {
    const link = mail.querySelector('link')!.getAttribute('href')!
    const messageId = new URLSearchParams(link).get('message_id')!

    if (!previousNewMails.has(messageId)) {
      const issuedDate = getDate(mail, 'issued')

      if (Date.now() - issuedDate < 60000) {
        previousNewMails.add(messageId)

        newMails.push({
          messageId,
          subject: getTextContent(mail, 'title'),
          summary: getTextContent(mail, 'summary').trim(),
          link,
          senderName: getTextContent(mail, 'name'),
          senderEmail: getTextContent(mail, 'email')
        })
      }
    }
  }

  return newMails
}

export async function fetchGmailFeed() {
  const feedDocument = await fetchGmail(`feed/atom?v=${Date.now()}`)
    .then(async (response) => response.text())
    .then((xml) => parseAtomToDocument(xml))

  updateModifiedDates(feedDocument)

  const isFeedModified = previousModifiedDate !== currentModifiedDate

  if (!isFeedModified) {
    return
  }

  const unreadCount = getUnreadCount(feedDocument)
  ipcRenderer.send('gmail:unread-count', unreadCount)

  if (isInitialFeed) {
    isInitialFeed = false
  } else {
    const newMails = getNewMails(feedDocument)
    for (const newMail of newMails) {
      ipcRenderer.send('gmail:new-mail', newMail)
    }
  }
}

export async function initGmailFeed() {
  fetchGmailFeed()
  setInterval(fetchGmailFeed, 10000)
  setInterval(() => {
    previousNewMails.clear()
  }, 1000 * 60 * 30)
}
