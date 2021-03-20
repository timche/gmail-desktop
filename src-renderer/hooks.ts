import { useColorMode } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import ipc from './ipc'
import { Account, UnreadCounts, AppUpdateInfo, AppUpdateStatus } from './types'

export function useDarkMode() {
  const { setColorMode } = useColorMode()

  const handleDarkMode = (enabled: boolean) => {
    setColorMode(enabled ? 'dark' : 'light')
  }

  useEffect(() => {
    ipc.invoke('init-dark-mode').then(handleDarkMode)
    ipc.on('dark-mode-updated', handleDarkMode)
  }, [])
}

export function useIsCompactHeaderEnabled() {
  // Compact header is enabled by default in the app config
  const [isCompactHeaderEnabled, setIsCompactHeaderEnabled] = useState(true)

  useEffect(() => {
    ipc.invoke('is-compact-header-enabled').then(setIsCompactHeaderEnabled)
  }, [])

  return { isCompactHeaderEnabled }
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({})

  useEffect(() => {
    ipc.invoke('get-accounts').then(setAccounts)

    ipc.on('accounts-updated', (updatedAccounts: Account[]) => {
      setAccounts(updatedAccounts)
    })

    ipc.on('unread-counts-updated', (updatedUnreadCounts: UnreadCounts) => {
      setUnreadCounts(updatedUnreadCounts)
    })
  }, [])

  const selectAccount = (accountId: string) => {
    ipc.send('select-account', accountId)
  }

  return {
    accounts: accounts.map((account) => ({
      ...account,
      unreadCount: unreadCounts[account.id]
    })),
    selectAccount
  }
}

export function useAddAccount() {
  const [isAddingAccount, setIsAddingAccount] = useState(false)

  useEffect(() => {
    ipc.on('add-account-request', () => {
      setIsAddingAccount(true)
    })
  }, [])

  const addAccount = (account: Account) => {
    ipc.send('add-account', account)
    setIsAddingAccount(false)
  }

  const cancelAddAccount = () => {
    ipc.send('add-account-cancel')
    setIsAddingAccount(false)
  }

  return { isAddingAccount, addAccount, cancelAddAccount }
}

export function useEditAccount() {
  const [editingAccount, setEditingAccount] = useState<Account>()

  useEffect(() => {
    ipc.on('edit-account-request', (account: Account) => {
      setEditingAccount(account)
    })
  }, [])

  const saveEditAccount = (account: Account) => {
    ipc.send('edit-account-save', account)
    setEditingAccount(undefined)
  }

  const cancelEditAccount = () => {
    ipc.send('edit-account-cancel')
    setEditingAccount(undefined)
  }

  const removeAccount = (accountId: string) => {
    ipc.send('remove-account', accountId)
    setEditingAccount(undefined)
  }

  return {
    isEditingAccount: Boolean(editingAccount),
    editingAccount,
    saveEditAccount,
    cancelEditAccount,
    removeAccount
  }
}

export function useAppUpdate() {
  const [updateStatus, setUpdateStatus] = useState<
    AppUpdateStatus | undefined
  >()
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | undefined>()
  const [updateDownloadPercent, setUpdateDownloadPercent] = useState(0)
  const [showReleaseNotes, setShowReleaseNotes] = useState(false)

  useEffect(() => {
    ipc.on('update:available', (updateInfo) => {
      setUpdateInfo(updateInfo)
      setUpdateStatus('available')
    })

    ipc.on('update:download-progress', (downloadPercent) => {
      setUpdateDownloadPercent(downloadPercent)
    })

    ipc.on('update:install', () => {
      setUpdateStatus('install')
    })
  }, [])

  const resetStates = () => {
    setUpdateStatus(undefined)
    setUpdateInfo(undefined)
    setUpdateDownloadPercent(0)
    setShowReleaseNotes(false)
  }

  const downloadUpdate = () => {
    ipc.send('update:download')
    setUpdateStatus('downloading')
  }

  const installUpdate = () => {
    ipc.send('update:install')
  }

  const dismissUpdate = () => {
    ipc.send('update:dismiss')
    resetStates()
  }

  const cancelUpdateDownload = () => {
    ipc.send('update:cancel-download')
    resetStates()
  }

  const toggleReleaseNotes = (visible: boolean) => {
    ipc.send('update:toggle-release-notes', visible)
    setShowReleaseNotes(visible)
  }

  return {
    updateStatus,
    updateInfo,
    updateDownloadPercent,
    downloadUpdate,
    installUpdate,
    dismissUpdate,
    cancelUpdateDownload,
    toggleReleaseNotes,
    showReleaseNotes
  }
}
