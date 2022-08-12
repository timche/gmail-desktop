import React from 'react'
import { Tabs, TabList, Tab, Badge, useColorModeValue } from '@chakra-ui/react'
import { topElementHeight } from '../../constants'
import { Account } from '../../types'
import { darkTheme, lightTheme } from '../../theme'

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
  const activeBg = useColorModeValue(lightTheme.bg[1], darkTheme.bg[1])
  const activeBorderBottomColor = useColorModeValue(
    'gray.200',
    'whiteAlpha.300'
  )
  const disabledTextColor = useColorModeValue(
    lightTheme.text.disabled,
    darkTheme.text.disabled
  )

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
      <TabList height={`${topElementHeight}px`} borderBottomWidth="1px">
        {children}
        {accounts.map(({ id, label, unreadCount, selected }) => {
          return (
            <Tab
              key={id}
              _active={{
                bg: activeBg,
                borderBottomWidth: '1px',
                borderBottomColor: activeBorderBottomColor
              }}
              _focus={{ outline: 'none' }}
              onClick={() => {
                if (accounts[selectedAccountIndex]?.id !== id) {
                  onSelectAccount(id)
                }
              }}
              color={selected ? undefined : disabledTextColor}
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
