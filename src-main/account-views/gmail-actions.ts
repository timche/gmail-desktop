import { ipcRenderer } from 'electron'
import { refreshInbox } from './gmail-inbox'

declare global {
  interface Window {
    GM_ACTION_TOKEN: string
  }
}

const mailActions = {
  archive: 'rc_^i',
  markAsRead: 'rd',
  delete: 'tr',
  markAsSpam: 'sp'
}

function getActionToken() {
  return window.GM_ACTION_TOKEN
}

export async function fetchGmail(
  path: string,
  fetchOptions?: Parameters<typeof fetch>[1]
) {
  return fetch(`https://mail.google.com/mail/u/0/${path}`, fetchOptions)
}

async function sendMailAction(
  mailId: string,
  action: keyof typeof mailActions
) {
  const parameters = new URLSearchParams({
    t: mailId,
    at: getActionToken(),
    act: mailActions[action]
  }).toString()

  return fetchGmail(`?${parameters}`)
}

export function handleGmailActions() {
  ipcRenderer.on('gmail:archive-mail', async (_event, mailId: string) => {
    await sendMailAction(mailId, 'archive')
    refreshInbox()
  })

  ipcRenderer.on('gmail:mark-mail-as-read', async (_event, mailId: string) => {
    await sendMailAction(mailId, 'markAsRead')
    refreshInbox()
  })

  ipcRenderer.on('gmail:delete-mail', async (_event, mailId: string) => {
    await sendMailAction(mailId, 'delete')
    refreshInbox()
  })

  ipcRenderer.on('gmail:mark-mail-as-spam', async (_event, mailId: string) => {
    await sendMailAction(mailId, 'markAsSpam')
    refreshInbox()
  })
}
