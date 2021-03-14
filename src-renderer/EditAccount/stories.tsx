import { action } from '@storybook/addon-actions'
import { nanoid } from 'nanoid'
import EditAccount from '.'

export default {
  title: 'EditAccount'
}

export const Default = () => (
  <EditAccount
    account={{ id: nanoid(), label: 'Work' }}
    onSave={action('onSave')}
    onCancel={action('onCancel')}
    onRemove={action('onRemove')}
  />
)
