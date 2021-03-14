import * as esbuild from 'esbuild'

const isProd = process.env['NODE_ENV'] === 'production'

function logBuildSuccessful() {
  console.log('Build succeeded')
}

function logBuildFailure(error: esbuild.BuildFailure) {
  console.error('Build failed:', error)
}

esbuild
  .build({
    entryPoints: ['./renderer/index.tsx'],
    bundle: true,
    sourcemap: !isProd,
    outfile: './dist-renderer/index.js',
    define: {
      'process.env.NODE_ENV': isProd ? '"production"' : '"development"'
    },
    watch: !isProd
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

    if (isProd && stop) {
      stop()
    }
  })
  .catch((error: esbuild.BuildFailure) => {
    logBuildFailure(error)
    process.exit(1)
  })
