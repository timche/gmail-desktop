const compile = require('./utils/compile')

async function compileMain() {
  await Promise.all([
    compile('main', {
      entryPoints: ['src-main/app.ts'],
      platform: 'node',
      target: 'node14.16.0',
      external: ['electron'],
      loader: {
        '.json': 'json',
        '.css': 'text'
      },
      outfile: 'dist-main/app.js'
    }),
    compile('main-preload', {
      entryPoints: [
        'src-main/main-window/preload.ts',
        'src-main/account-views/preload.ts'
      ],
      target: 'chrome89',
      external: ['electron'],
      outdir: 'dist-main'
    })
  ])
}

compileMain()
