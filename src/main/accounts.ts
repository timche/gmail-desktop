import { ipcMain } from 'electron'
import {
  createAccountView,
  removeAccountView,
  selectAccountView,
  showAccountViews,
  updateAllAccountViewBounds
} from './account-views'
import { initOrUpdateAppMenu } from './menus/app'
import config, { ConfigKey } from './config'
import { sendToMainWindow, getMainWindow } from './main-window'
import { initOrUpdateDockMenu } from './menus/dock'
import { initOrUpdateTrayMenu } from './menus/tray'
import { DEFAULT_ACCOUNT_ID } from './constants'
import { Account } from '../types'

export function getAccount(accountId: string) {
  return getAccounts().find(({ id }) => id === accountId)
}

export function getAccounts() {
  return config.get(ConfigKey.Accounts)
}

export function isDefaultAccount(accountId: string) {
  return accountId === DEFAULT_ACCOUNT_ID
}

export function getDefaultAccount() {
  return getAccounts().find(({ id }) => isDefaultAccount(id))
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
  initOrUpdateAppMenu()
  initOrUpdateDockMenu()
  initOrUpdateTrayMenu()
}

export function addAccount(addedAccount: Account) {
  const accounts = getAccounts()
    .map((account) => ({ ...account, selected: false }))
    .concat({ ...addedAccount, selected: true })
  sendToMainWindow('accounts-updated', accounts)
  createAccountView(addedAccount.id, true)
  updateAllAccountViewBounds()
  config.set(ConfigKey.Accounts, accounts)
  initOrUpdateAppMenu()
  initOrUpdateDockMenu()
  initOrUpdateTrayMenu()
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
  initOrUpdateAppMenu()
  initOrUpdateDockMenu()
  initOrUpdateTrayMenu()
}

export function getAccountsMenuItems(withAccelerator?: boolean) {
  return config.get(ConfigKey.Accounts).map(({ id, label }, index) => ({
    label,
    click() {
      selectAccount(id)
      getMainWindow().show()
    },
    accelerator: withAccelerator ? `CommandOrControl+${index + 1}` : undefined
  }))
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
