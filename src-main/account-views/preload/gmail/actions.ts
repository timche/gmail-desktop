import { ipcRenderer } from 'electron'
import { refreshInbox } from './inbox'

let gmailActionToken: string | undefined

const mailActions = {
  archive: 'rc_^i',
  markAsRead: 'rd',
  delete: 'tr',
  markAsSpam: 'sp'
}

async function fetchActionToken() {
  if (!gmailActionToken) {
    const gmailResponse = await fetchGmail().then(async (response) =>
      response.text()
    )
    gmailActionToken = /var GM_ACTION_TOKEN="([\w-]+)";/.exec(
      gmailResponse
    )?.[1]
  }

  return gmailActionToken
}

export async function fetchGmail(
  path = '',
  fetchOptions?: Parameters<typeof fetch>[1]
) {
  return fetch(`https://mail.google.com/mail/u/0/${path}`, fetchOptions)
}

async function sendMailAction(
  mailId: string,
  action: keyof typeof mailActions
) {
  await fetchActionToken()

  if (!gmailActionToken) {
    return
  }

  const parameters = new URLSearchParams({
    t: mailId,
    at: gmailActionToken,
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

  ipcRenderer.on('gmail:open-mail', async (_event, messageId: string) => {
    window.location.hash = `#inbox/${messageId}`
  })
}
