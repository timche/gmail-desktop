import React from 'react'
import {
  Button,
  ButtonGroup,
  CloseButton,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteIcon,
  EditIcon
} from '@chakra-ui/icons'
import { Account } from '../../types'
import { Except } from 'type-fest'

interface AccountsProps {
  accounts: Array<Except<Account, 'selected'>>
  onChangeOrder: (accounts: Array<Except<Account, 'selected'>>) => void
  onEdit: (accountId: string) => void
  onRemove: (accountId: string) => void
  onAdd: () => void
  onClose: () => void
}

function Accounts({
  accounts,
  onChangeOrder,
  onEdit,
  onRemove,
  onAdd,
  onClose
}: AccountsProps) {
  return (
    <Container>
      <Heading mb="8">Accounts</Heading>
      <TableContainer mb="4">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th width="100%">Label</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {accounts.map(({ id, label }, index) => (
              <Tr key={id}>
                <Td>{label}</Td>
                <Td>
                  <HStack>
                    <IconButton
                      aria-label="Move account up"
                      icon={<ArrowUpIcon />}
                      isDisabled={index === 0}
                    />
                    <IconButton
                      aria-label="Move account down"
                      icon={<ArrowDownIcon />}
                      isDisabled={index === accounts.length - 1}
                    />
                    <IconButton
                      aria-label="Edit account"
                      icon={<EditIcon />}
                      onClick={() => {
                        onEdit(id)
                      }}
                    />
                    <IconButton
                      colorScheme="red"
                      variant="outline"
                      aria-label="Remove account"
                      icon={<DeleteIcon />}
                      onClick={() => {
                        onRemove(id)
                      }}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <HStack justifyContent="space-between">
        <Button
          onClick={() => {
            onAdd()
          }}
        >
          Add Account
        </Button>
        <Button
          colorScheme="blue"
          onClick={() => {
            onClose()
          }}
        >
          Close
        </Button>
      </HStack>
    </Container>
  )
}

export default Accounts
