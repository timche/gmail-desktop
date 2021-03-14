import * as React from 'react'
import { Tabs, TabList, Tab, Badge } from '@chakra-ui/react'
import { accountTabsHeight } from '../constants'
import { Account } from '../types'

interface AccountsTabProps {
  accounts: Account[]
  onSelectAccount: (accountId: string) => void
  isDisabled: boolean
}

function AccountsTab({
  accounts,
  onSelectAccount,
  isDisabled
}: AccountsTabProps) {
  const selectedAccountIndex = accounts.findIndex(({ selected }) => selected)

  return (
    <Tabs
      isFitted
      flex="1"
      colorScheme="red"
      size="sm"
      index={selectedAccountIndex}
    >
      <TabList height={accountTabsHeight} borderBottomWidth="1px">
        {accounts.map(({ id, label, unreadCount }) => {
          return (
            <Tab
              key={id}
              _focus={{ outline: 'none' }}
              onClick={() => {
                if (accounts[selectedAccountIndex].id !== id) {
                  onSelectAccount(id)
                }
              }}
              borderBottomWidth="1px"
              mb="-1px"
              cursor="default"
              isDisabled={isDisabled}
            >
              {label}
              {unreadCount > 0 && (
                <Badge ml="2" colorScheme="red">
                  {unreadCount}
                </Badge>
              )}
            </Tab>
          )
        })}
      </TabList>
    </Tabs>
  )
}

export default AccountsTab
