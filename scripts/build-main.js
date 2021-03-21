const build = require('./utils/build')

async function buildMain() {
  await Promise.all([
    build('main', {
      entryPoints: ['src-main/app.ts'],
      platform: 'node',
      target: 'node14.16.0',
      external: ['electron'],
      loader: {
        '.json': 'json',
        '.css': 'text'
      },
      outfile: 'build-main/app.js'
    }),
    build('main-preload', {
      entryPoints: [
        'src-main/main-window/preload.ts',
        'src-main/account-views/preload.ts'
      ],
      target: 'chrome89',
      external: ['electron'],
      outdir: 'build-main'
    })
  ])
}

buildMain()
