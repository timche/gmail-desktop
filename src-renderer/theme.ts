import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  // @ts-expect-error
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#121212' : 'white'
      }
    })
  }
})

export default theme
