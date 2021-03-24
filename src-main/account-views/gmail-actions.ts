import { ipcRenderer } from 'electron'

declare global {
  interface Window {
    GM_ACTION_TOKEN: string
  }
}

const actions = {
  archive: 'rc_^i'
}

function getActionToken() {
  return window.GM_ACTION_TOKEN
}

export async function fetchGmail(path: string) {
  return fetch(`https://mail.google.com/mail/u/0/${path}`)
}

export async function archiveMail(mailId: string) {
  const parameters = new URLSearchParams({
    t: mailId,
    at: getActionToken(),
    act: actions.archive
  }).toString()

  return fetchGmail(`?${parameters}`)
}

export function handleGmailActions() {
  ipcRenderer.on('mail:archive', (_event, mailId: string) => {
    archiveMail(mailId)
  })
}
