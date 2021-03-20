const compile = require('./utils/compile')

compile('renderer', (isProd) => ({
  entryPoints: ['./src-renderer/index.tsx'],
  target: 'chrome89',
  outfile: './dist-renderer/index.js',
  define: {
    'process.env.NODE_ENV': isProd ? '"production"' : '"development"'
  }
}))
