export interface Account {
  id: string
  label: string
  selected: boolean
}

export interface Mail {
  messageId: string
  subject: string
  summary: string
  link: string
  sender: {
    name: string
    email: string
  }
}

export type UnreadCounts = Record<string, number>

export type AppUpdateStatus = 'available' | 'downloading' | 'install'

export type AppUpdateInfo = {
  version: string
  releaseNotes: Array<{ version: string; note: string | null }>
}
