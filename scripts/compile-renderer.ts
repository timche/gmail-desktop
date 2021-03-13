import * as esbuild from 'esbuild'

const isProd = process.env['NODE_ENV'] === 'production'

function logBuildWarnings(warnings: esbuild.Message[]) {
  for (const warning of warnings) {
    console.log(warning)
  }
}

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
          onRebuild: (error, result) => {
            if (error) {
              logBuildFailure(error)
              return
            }

            if (result?.warnings) {
              logBuildWarnings(result.warnings)
            }

            logBuildSuccessful()
          }
        }
      : undefined
  })
  .then(({ warnings, stop }) => {
    logBuildWarnings(warnings)
    logBuildSuccessful()

    if (isProd && stop) {
      stop()
    }
  })
  .catch((error: esbuild.BuildFailure) => {
    logBuildFailure(error)
    process.exit(1)
  })
