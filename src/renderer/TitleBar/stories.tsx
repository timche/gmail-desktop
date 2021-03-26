import React, { useState } from 'react'
import { action } from '@storybook/addon-actions'
import TitleBar from '.'

export default {
  title: 'TitleBar'
}

export const Default = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  return (
    <TitleBar
      isMaximized={isMaximized}
      onClickMenu={action('onClickMenu')}
      onMinimze={action('onMinimize')}
      onMaximize={() => {
        action('onMaximize')()
        setIsMaximized(true)
      }}
      onUnmaximize={() => {
        action('onUnmaximize')()
        setIsMaximized(false)
      }}
      onClose={action('onClose')}
    />
  )
}
