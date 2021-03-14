import * as esbuild from 'esbuild'

const isProd = process.env.NODE_ENV === 'production'

function logBuildSuccessful() {
  console.log('Build succeeded')
}

function logBuildFailure(error: esbuild.BuildFailure) {
  console.error('Build failed:', error)
}

esbuild
  .build({
    entryPoints: ['./src-renderer/index.tsx'],
    bundle: true,
    sourcemap: !isProd,
    outfile: './dist-renderer/index.js',
    define: {
      'process.env.NODE_ENV': isProd ? '"production"' : '"development"'
    },
    watch: isProd
      ? undefined
      : {
          onRebuild: (error) => {
            if (error) {
              logBuildFailure(error)
              return
            }

            logBuildSuccessful()
          }
        }
  })
  .then(({ stop }) => {
    logBuildSuccessful()

    if (isProd && stop) {
      stop()
    }
  })
  .catch((error: esbuild.BuildFailure) => {
    logBuildFailure(error)
    throw error
  })
