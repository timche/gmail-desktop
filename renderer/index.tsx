import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { useColorMode, Flex, Tabs, TabList, Tab, Badge } from '@chakra-ui/react'
import theme from './theme'
import { tabsHeight } from './constants'
import TrafficLightsSpace from './components/TrafficLightsSpace'

function App() {
  const [tabs, setTabs] = React.useState<{ id: string; label: string }[]>([])
  const [unreadCounts, setUnreadCounts] = React.useState<
    Record<string, number>
  >({})
  const [selectedTab, setSelectedTab] = React.useState()
  const { setColorMode } = useColorMode()

  React.useEffect(() => {
    const init = async () => {
      window.ipc.on('dark-mode:updated', (darkMode: boolean) => {
        setColorMode(darkMode ? 'dark' : 'light')
      })

      window.ipc.on(
        'unread-count',
        (accountId: string, unreadCount: number) => {
          setUnreadCounts({ ...unreadCounts, [accountId]: unreadCount })
        }
      )

      window.ipc.on('account-selected', (accountId: string) => {
        setSelectedTab(accountId)
      })

      setTabs(await window.ipc.invoke('accounts'))
      setSelectedTab(await window.ipc.invoke('selected-account'))
      setColorMode((await window.ipc.invoke('dark-mode')) ? 'dark' : 'light')
    }

    init()
  }, [])

  if (tabs.length < 2) {
    return null
  }

  return (
    <Flex
      style={{
        WebkitAppRegion: 'drag'
      }}
    >
      <TrafficLightsSpace />
      {/* @ts-ignore: Type error with children */}
      <Tabs
        isFitted
        flex="1"
        colorScheme="red"
        size="sm"
        index={tabs.findIndex((tab) => tab.id === selectedTab)}
      >
        <TabList height={tabsHeight} borderBottomWidth="1px">
          {tabs.map(({ id, label }) => {
            const unreadCount = unreadCounts[id]
            return (
              <Tab
                key={`${id}_${unreadCount}`}
                _focus={{ outline: 'none' }}
                onClick={() => {
                  window.ipc.invoke('account-selected', id)
                  setSelectedTab(id)
                }}
              >
                {label}
                {unreadCount > 0 && <Badge ml={1}>{unreadCount}</Badge>}
              </Tab>
            )
          })}
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
