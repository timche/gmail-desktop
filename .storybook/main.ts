const path = require('path')

const toPath = (_path) => path.join(process.cwd(), _path)

module.exports = {
  core: {
    builder: 'webpack5',
    disableTelemetry: true
  },
  stories: ['../src/renderer/**/stories.tsx'],
  addons: [
    '@storybook/addon-toolbars',
    '@storybook/addon-actions',
    '@storybook/addon-viewport'
  ],
  typescript: {
    reactDocgen: false
  },
  webpackFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          '@emotion/core': toPath('node_modules/@emotion/react'),
          'emotion-theming': toPath('node_modules/@emotion/react')
        }
      }
    }
  }
}
