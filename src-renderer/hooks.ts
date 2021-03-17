import { useColorMode } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import ipc from './ipc'
import { Account, UnreadCounts } from './types'

export function useDarkMode() {
  const { setColorMode } = useColorMode()

  const handleDarkMode = (enabled: boolean) => {
    setColorMode(enabled ? 'dark' : 'light')
  }

  useEffect(() => {
    ipc.invoke('get-dark-mode').then(handleDarkMode)
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
