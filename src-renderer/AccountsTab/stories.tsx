import AccountsTab from '.'
import { Meta } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { nanoid } from 'nanoid'

export default {
  title: 'AccountsTab'
} as Meta

export const Default = () => (
  <AccountsTab
    accounts={[
      { id: nanoid(), label: 'Personal', selected: true, unreadCount: 2 },
      { id: nanoid(), label: 'Work', selected: false, unreadCount: 0 }
    ]}
    onSelectAccount={action('onSelectAccount')}
  />
)
