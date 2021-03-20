export interface Account {
  id: string
  label: string
  unreadCount?: number
  selected?: boolean
}

export type UnreadCounts = Record<string, number>

export type AppUpdateStatus = 'available' | 'downloading' | 'install'

export type AppUpdateInfo = {
  version: string
  releaseNotes: Array<{ version: string; note: string | null }>
}
