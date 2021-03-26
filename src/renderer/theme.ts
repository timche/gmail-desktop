import { extendTheme } from '@chakra-ui/react'
import { darkTheme } from '../theme'

const theme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? darkTheme.bg[0] : 'white'
      }
    })
  }
})

export default theme
