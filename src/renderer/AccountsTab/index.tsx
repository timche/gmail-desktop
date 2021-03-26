import React from 'react'
import { Tabs, TabList, Tab, Badge } from '@chakra-ui/react'
import { TOP_ELEMENT_HEIGHT } from '../constants'
import { Account } from '../../types'

interface AccountsTabProps {
  accounts: Array<Account & { unreadCount?: number }>
  onSelectAccount: (accountId: string) => void
  isDisabled?: boolean
  children?: React.ReactNode
  style?: React.ComponentProps<typeof Tabs>['style']
}

function AccountsTab({
  accounts,
  onSelectAccount,
  isDisabled,
  children,
  style
}: AccountsTabProps) {
  if (accounts.length < 2) {
    return null
  }

  const selectedAccountIndex = accounts.findIndex(({ selected }) => selected)

  return (
    <Tabs
      isFitted
      colorScheme="red"
      size="sm"
      index={selectedAccountIndex}
      style={style}
    >
      <TabList height={TOP_ELEMENT_HEIGHT} borderBottomWidth="1px">
        {children}
        {accounts.map(({ id, label, unreadCount }) => {
          return (
            <Tab
              key={id}
              _focus={{ outline: 'none' }}
              onClick={() => {
                if (accounts[selectedAccountIndex]?.id !== id) {
                  onSelectAccount(id)
                }
              }}
              borderBottomWidth="1px"
              mb="-1px"
              cursor="default"
              isDisabled={isDisabled}
            >
              {label}
              {typeof unreadCount === 'number' && unreadCount > 0 && (
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
