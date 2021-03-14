import { action } from '@storybook/addon-actions'
import { nanoid } from 'nanoid'
import AddAccount from '.'

export default {
  title: 'AddAccount'
}

export const Default = () => (
  <AddAccount onAdd={action('onAdd')} onCancel={action('onCancel')} />
)
