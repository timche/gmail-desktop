const { src, dest, parallel } = require('gulp')
const ts = require('gulp-typescript')
const uglify = require('gulp-uglify')
const gulpIf = require('gulp-if')
const prettier = require('gulp-prettier')
const eslint = require('gulp-eslint')

const isDev = process.env.NODE_ENV !== 'production'

// Get TypeScript config from tsconfig.json
const tsProject = ts.createProject('tsconfig.json')

function compileJs() {
  return src('src/**/*.js')
    .pipe(gulpIf(!isDev, uglify()))
    .pipe(dest('build'))
}

function compileTs() {
  return src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(gulpIf(!isDev, uglify()))
    .pipe(dest('build'))
}

function validateTsAndJs() {
  return src('src/**/*.{js,ts}')
    .pipe(prettier.check())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

function copyResources() {
  return src([
    'src/resources/**/*',
    '!src/resources/build',
    '!src/resources/build/*'
  ]).pipe(dest('build/resources'))
}

exports.ts = compileTs
exports.js = compileJs
exports.resources = copyResources
exports.validate = validateTsAndJs

exports.default = parallel(compileTs, compileJs, copyResources)
