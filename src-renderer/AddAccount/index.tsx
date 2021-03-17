import * as React from 'react'
import {
  Container,
  Input,
  Flex,
  Heading,
  Button,
  FormControl,
  FormLabel
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
      <Heading mb="8">Add Account</Heading>
      <FormControl mb="8" isRequired>
        <FormLabel htmlFor="label">Label</FormLabel>
        <Input
          id="label"
          placeholder="Work, me@work.com, ..."
          value={label}
          onChange={(event) => {
            setAccount({ id, label: event.target.value })
          }}
          isInvalid={isLabelRequired}
          autoFocus
        />
      </FormControl>
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
