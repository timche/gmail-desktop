import { useEffect, useState } from 'react'
import ipc from './ipc'
import { Account } from './types'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    ipc.invoke('get-accounts').then(setAccounts)

    ipc.on('accounts-updated', (accounts: Account[]) => {
      setAccounts(accounts)
    })
  }, [])

  const selectAccount = (accountId: string) => {
    ipc.send('select-account', accountId)
  }

  return { accounts, selectAccount }
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
