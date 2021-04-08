const build = require('./utils/build')

async function buildMain() {
  await Promise.all([
    build('main', {
      entryPoints: ['src/main/index.ts'],
      platform: 'node',
      target: 'node14.16.0',
      external: ['electron', '@sindresorhus/do-not-disturb'],
      loader: {
        '.json': 'json',
        '.css': 'text',
        '.html': 'file'
      },
      assetNames: '[name]',
      outfile: 'build-js/main/index.js'
    }),
    build('main-preload-main-window', {
      entryPoints: ['src/main/main-window/preload.ts'],
      target: 'chrome89',
      external: ['electron'],
      outfile: 'build-js/main/preload/main-window.js'
    }),
    build('main-preload-account-views', {
      entryPoints: ['src/main/account-views/preload/index.ts'],
      target: 'chrome89',
      external: ['electron'],
      outfile: 'build-js/main/preload/account-view.js'
    })
  ])
}

buildMain()
