import * as React from 'react'
import {
  Container,
  Text,
  Input,
  Box,
  Flex,
  Heading,
  Tag,
  Button,
  Spacer
} from '@chakra-ui/react'
import { Account } from '../types'

interface EditAccountProps {
  account: Account
  onSave: (account: Account) => void
  onCancel: () => void
  onRemove: (accountId: string) => void
}

function EditAccount({
  onSave,
  onCancel,
  onRemove,
  ...props
}: EditAccountProps) {
  const [account, setAccount] = React.useState(props.account)
  const { id, label } = account

  const isLabelRequired = label.length === 0

  return (
    <Container>
      <Heading mb="2">Edit Account</Heading>
      <Tag mb="8">ID: {id}</Tag>
      <Box mb="8">
        <label>
          <Text mb="1" fontSize="sm">
            Label
          </Text>
          <Input
            value={label}
            onChange={(event) => {
              setAccount({ id, label: event.target.value })
            }}
            placeholder="Work, work@example.com, ..."
            isInvalid={isLabelRequired}
            autoFocus
          />
        </label>
      </Box>
      <Flex justifyContent="flex-end">
        <Button
          colorScheme="red"
          onClick={() => {
            onRemove(id)
          }}
          disabled={id === 'default'}
        >
          Remove
        </Button>
        <Spacer />
        <Button
          mr="2"
          onClick={() => {
            onCancel()
          }}
        >
          Cancel
        </Button>
        <Button
          colorScheme="blue"
          onClick={() => {
            if (label) {
              onSave({ id, label })
            }
          }}
          disabled={isLabelRequired}
        >
          Save
        </Button>
      </Flex>
    </Container>
  )
}

export default EditAccount
