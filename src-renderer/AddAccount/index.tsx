import * as React from 'react'
import {
  Container,
  Text,
  Input,
  Box,
  Flex,
  Heading,
  Tag,
  Button
} from '@chakra-ui/react'
import { Account } from '../types'
import { nanoid } from 'nanoid'

interface AddAccountProps {
  onAdd: (account: Account) => void
  onCancel: () => void
}

function AddAccount({ onAdd, onCancel }: AddAccountProps) {
  const [account, setAccount] = React.useState({ id: nanoid(), label: '' })
  const { id, label } = account

  const isLabelRequired = label.length === 0

  return (
    <Container>
      <Heading mb="2">Add Account</Heading>
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
              onAdd({ id, label })
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

export default AddAccount
