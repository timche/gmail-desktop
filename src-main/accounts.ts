import { globalShortcut, ipcMain } from 'electron'
import {
  createAccountView,
  removeAccountView,
  selectAccountView,
  showAccountViews,
  updateAllAccountViewBounds
} from './account-views'
import config, { ConfigKey, Account } from './config'
import { sendToMainWindow } from './main-window'

const DEFAULT_ACCOUNT_ID = 'default'

export function getAccounts() {
  return config.get(ConfigKey.Accounts)
}

export function getDefaultAccount() {
  return getAccounts().find(({ id }) => id === 'default')
}

export function getSelectedAccount() {
  return getAccounts().find(({ selected }) => selected)
}

export function selectAccount(accountId: string) {
  const accounts = getAccounts().map((account) => ({
    ...account,
    selected: account.id === accountId
  }))
  selectAccountView(accountId)
  sendToMainWindow('accounts-updated', accounts)
  config.set(ConfigKey.Accounts, accounts)
}

export function editAccount(editedAccount: Account) {
  const accounts = getAccounts().map((account) =>
    account.id === editedAccount.id
      ? {
          ...account,
          ...editedAccount
        }
      : account
  )
  sendToMainWindow('accounts-updated', accounts)
  config.set(ConfigKey.Accounts, accounts)
}

export function addAccount(addedAccount: Account) {
  const accounts = getAccounts()
    .map((account) => ({ ...account, selected: false }))
    .concat({ ...addedAccount, selected: true })
  sendToMainWindow('accounts-updated', accounts)
  createAccountView(addedAccount.id, true)
  updateAllAccountViewBounds()
  config.set(ConfigKey.Accounts, accounts)
}

export function removeAccount(accountId: string) {
  const accounts = getAccounts().filter((account) => account.id !== accountId)

  const defaultAccount = accounts.find(({ id }) => id === DEFAULT_ACCOUNT_ID)

  if (defaultAccount) {
    defaultAccount.selected = true
    selectAccountView(defaultAccount.id)
  }

  sendToMainWindow('accounts-updated', accounts)
  removeAccountView(accountId)

  config.set(ConfigKey.Accounts, accounts)
}

function registerAccountShortcuts() {
  for (let i = 1; i <= 9; i++) {
    globalShortcut.register(`CommandOrControl+${i}`, () => {
      const account = getAccounts()[i - 1]
      if (account) {
        selectAccount(account.id)
      }
    })
  }
}

export function initAccounts() {
  ipcMain.handle('get-accounts', () => {
    return getAccounts()
  })

  ipcMain.on('select-account', (_event, accountId: string) => {
    selectAccount(accountId)
  })

  ipcMain.on('edit-account-save', (_event, account: Account) => {
    showAccountViews()
    editAccount(account)
  })

  ipcMain.on('edit-account-cancel', () => {
    showAccountViews()
  })

  ipcMain.on('add-account', (_event, account: Account) => {
    showAccountViews()
    addAccount(account)
  })

  ipcMain.on('add-account-cancel', () => {
    showAccountViews()
  })

  ipcMain.on('remove-account', (_event, accountId: string) => {
    showAccountViews()
    removeAccount(accountId)
  })

  registerAccountShortcuts()

  const accounts = getAccounts()

  for (const account of accounts) {
    createAccountView(account.id)
  }

  updateAllAccountViewBounds()

  const selectedAccount = getSelectedAccount()

  if (selectedAccount) {
    selectAccountView(selectedAccount.id)
  }
}
