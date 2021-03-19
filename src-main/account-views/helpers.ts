import { isDefaultAccount } from '../accounts'

export function getSessionPartitionKey(accountId: string) {
  return isDefaultAccount(accountId) ? undefined : `persist:${accountId}`
}
