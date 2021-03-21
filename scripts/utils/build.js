const esbuild = require('esbuild')

const isProd = process.env.NODE_ENV === 'production'
const watch = process.env.WATCH === 'true'

function build(name, buildOptions) {
  const logBuildSuccessful = () => {
    console.log(`[build:${name}]`, 'Build succeeded')
  }

  const logBuildFailure = (error) => {
    console.log(`[build:${name}]`, 'Build failed:', error)
  }

  return esbuild
    .build({
      ...(typeof buildOptions === 'function'
        ? buildOptions(isProd)
        : buildOptions),
      bundle: true,
      sourcemap: true,
      watch: watch
        ? {
            onRebuild: (error) => {
              if (error) {
                logBuildFailure(error)
                return
              }

              logBuildSuccessful()
            }
          }
        : undefined
    })
    .then(({ stop }) => {
      logBuildSuccessful()
      if (!watch && stop) {
        stop()
      }
    })
    .catch((error) => {
      logBuildFailure(error)
      throw error
    })
}

module.exports = build
