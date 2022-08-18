import React from 'react'
import { action } from '@storybook/addon-actions'
import { nanoid } from 'nanoid'
import EditAccounts from '.'

export default {
  title: 'EditAccounts'
}

export const Default = () => (
  <EditAccounts
    accounts={[
      { id: nanoid(), label: 'Personal' },
      { id: nanoid(), label: 'Work' },
      { id: nanoid(), label: 'Other' }
    ]}
    onChangeOrder={action('onChangeOrder')}
  />
)
