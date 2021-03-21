import { useEffect, useState } from 'react'
import { useColorMode } from '@chakra-ui/react'
import { IS_MAC_OS } from './constants'
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

export function useTitlebar() {
  // Compact header is enabled by default in the app config
  const [isCompactHeaderEnabled, setIsCompactHeaderEnabled] = useState(true)

  useEffect(() => {
    ipc.invoke('config:compact-header').then(setIsCompactHeaderEnabled)
  }, [])

  return { isTitlebarHidden: IS_MAC_OS && isCompactHeaderEnabled }
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
  const [isReleaseNotesVisible, setIsReleaseNotesVisible] = useState(false)

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
    setIsReleaseNotesVisible(false)
  }

  return {
    updateStatus,
    updateInfo,
    updateDownloadPercent,
    downloadUpdate: () => {
      ipc.send('update:download')
      setUpdateStatus('downloading')
    },
    installUpdate: () => {
      ipc.send('update:install')
    },
    dismissUpdate: () => {
      ipc.send('update:dismiss')
      resetStates()
    },
    cancelUpdateDownload: () => {
      ipc.send('update:cancel-download')
      resetStates()
    },
    toggleReleaseNotes: (visible: boolean) => {
      ipc.send('update:toggle-release-notes', visible)
      setIsReleaseNotesVisible(visible)
    },
    isReleaseNotesVisible,
    skipUpdateVersion: (version: string) => {
      ipc.send('update:skip-version', version)
      resetStates()
    }
  }
}

export function useTitleBar() {
  const [isTitleBarEnabled, setIsTitleBarEnabled] = useState(!IS_MAC_OS)
  const [isWindowMaximized, setIsWindowMaximized] = useState(false)

  useEffect(() => {
    if (!IS_MAC_OS) {
      ipc.invoke('title-bar:is-enabled').then(setIsTitleBarEnabled)

      ipc.invoke('window:is-maximized').then(setIsWindowMaximized)

      ipc.on('window:maximized', () => {
        setIsWindowMaximized(true)
      })

      ipc.on('window:unmaximized', () => {
        setIsWindowMaximized(false)
      })
    }
  }, [])

  return {
    isTitleBarEnabled,
    isWindowMaximized,
    openAppMenu: () => {
      ipc.send('title-bar:open-app-menu')
    },
    minimzeWindow: () => {
      ipc.send('window:minimize')
    },
    maximizeWindow: () => {
      ipc.send('window:maximize')
    },
    unmaximizeWindow: () => {
      ipc.send('window:unmaximize')
    },
    closeWindow: () => {
      ipc.send('window:close')
    }
  }
}
