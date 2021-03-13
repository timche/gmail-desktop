import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { Flex, Box, Tabs, TabList, Tab } from '@chakra-ui/react'

const { ipcRenderer } = require('electron')

function MacOsTrafficLightsSpace() {
  return (
    <Box
      width="80px"
      height="40px"
      borderBottomWidth="2px"
      borderBottomColor="gray.200"
    />
  )
}

function App() {
  const [accounts, setAccounts] = React.useState()

  React.useEffect(() => {
    const getAccounts = async () => {
      setAccounts(await ipcRenderer.sendSync('get-accounts'))
    }
    getAccounts()
  }, [])

  return (
    <ChakraProvider>
      <Flex
        style={{
          WebkitAppRegion: 'drag'
        }}
      >
        <MacOsTrafficLightsSpace />
        {/* @ts-ignore: Type error with children */}
        <Tabs isFitted flex="1" colorScheme="red" size="sm">
          <TabList height="40px">
            <Tab _focus={{ outline: 'none' }}>tim@cheung.io</Tab>
            <Tab _focus={{ outline: 'none' }}>t.cheung@faceit.com</Tab>
          </TabList>
        </Tabs>
      </Flex>
    </ChakraProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
