import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { useColorMode, Flex, Box, Tabs, TabList, Tab } from '@chakra-ui/react'
import theme from './theme'

const height = '40px'

function MacOsTrafficLightsSpace() {
  const { colorMode } = useColorMode()

  return (
    <Box
      width="80px"
      height={height}
      borderBottomWidth="1px"
      borderBottomColor={colorMode === 'light' ? 'gray.200' : 'whiteAlpha.300'}
    />
  )
}

function App() {
  const [accounts, setAccounts] = React.useState<
    { id: string; label: string }[]
  >([])
  const { setColorMode } = useColorMode()

  React.useEffect(() => {
    const init = async () => {
      window.ipc.on('dark-mode:updated', (darkMode: boolean) => {
        setColorMode(darkMode ? 'dark' : 'light')
      })

      setAccounts(await window.ipc.invoke('accounts'))
      setColorMode((await window.ipc.invoke('dark-mode')) ? 'dark' : 'light')
    }

    init()
  }, [])

  if (accounts.length < 2) {
    return null
  }

  return (
    <Flex
      style={{
        WebkitAppRegion: 'drag'
      }}
    >
      <MacOsTrafficLightsSpace />
      {/* @ts-ignore: Type error with children */}
      <Tabs
        isFitted
        flex="1"
        colorScheme="red"
        size="sm"
        onChange={(tabIndex) => {
          window.ipc.invoke('account-selected', accounts[tabIndex].id)
        }}
      >
        <TabList height={height} borderBottomWidth="1px">
          {accounts.map(({ id, label }) => (
            <Tab key={id} _focus={{ outline: 'none' }}>
              {label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </Flex>
  )
}

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>,
  document.getElementById('root')
)
