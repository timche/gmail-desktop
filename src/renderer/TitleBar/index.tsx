import React, { ComponentProps } from 'react'
import {
  Center,
  Flex,
  IconButton as ChakraIconButton,
  Spacer,
  useColorModeValue
} from '@chakra-ui/react'
import { appRegionDragStyle, appRegionNoDragStyle } from '../helpers'
import { Except } from 'type-fest'
import CloseIcon from './icons/Close'
import EllipsisIcon from './icons/Ellipsis'
import MaximizeIcon from './icons/Maximize'
import MinimizeIcon from './icons/Minimize'
import RestoreIcon from './icons/Restore'

const titleBarHeight = 30

const IconButton = ({
  onClick,
  ...props
}: Except<ComponentProps<typeof ChakraIconButton>, 'aria-label'>) => {
  const hoverBg = useColorModeValue(
    'rgba(0, 0, 0, 0.05)',
    'rgba(255, 255, 255, 0.05)'
  )

  return (
    <ChakraIconButton
      onClick={() => {
        onClick()
      }}
      height={titleBarHeight}
      color="gray"
      aria-label=""
      variant="ghost"
      borderRadius="none"
      _hover={{
        bg: hoverBg
      }}
      _focus={{
        outline: 0
      }}
      style={appRegionNoDragStyle}
      {...props}
    />
  )
}

interface TitleBarProps {
  onClickMenu: () => void
  onMinimze: () => void
  isMaximized?: boolean
  onMaximize: () => void
  onUnmaximize: () => void
  onClose: () => void
}

function TitleBar({
  onClickMenu,
  onMinimze,
  isMaximized,
  onMaximize,
  onUnmaximize,
  onClose
}: TitleBarProps) {
  const bg = useColorModeValue('#f2f5f5', '#1a1a1a')

  return (
    <Flex
      height={titleBarHeight}
      bg={bg}
      position="relative"
      style={appRegionDragStyle}
    >
      <Center
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        fontSize="xs"
        color="gray"
      >
        Gmail Desktop
      </Center>
      <IconButton icon={<EllipsisIcon />} onClick={onClickMenu} />
      <Spacer />
      <IconButton icon={<MinimizeIcon />} onClick={onMinimze} />
      {isMaximized ? (
        <IconButton icon={<RestoreIcon />} onClick={onUnmaximize} />
      ) : (
        <IconButton icon={<MaximizeIcon />} onClick={onMaximize} />
      )}
      <IconButton icon={<CloseIcon />} onClick={onClose} />
    </Flex>
  )
}

export default TitleBar
