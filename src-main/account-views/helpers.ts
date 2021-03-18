export function getSessionPartitionKey(accountId: string) {
  return accountId === 'default' ? undefined : `persist:${accountId}`
}
