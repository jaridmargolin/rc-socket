'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'

/* -----------------------------------------------------------------------------
 * rollup config
 * -------------------------------------------------------------------------- */

const externals = [
  'core-js/modules/es.array.for-each',
  'core-js/modules/es.date.to-string',
  'core-js/modules/es.object.assign',
  'core-js/modules/web.dom-collections.for-each'
]

const sharedPlugins = [
  resolve({
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
    module: true
  }),
  commonjs(),
  babel({
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
    exclude: 'node_modules/**'
  })
]

export default [
  {
    input: 'src/rc-socket.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/rc-socket.js',
      format: 'umd',
      name: 'RcSocket',
      exports: 'named'
    }
  },
  {
    input: 'src/rc-socket.ts',
    external: externals,
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/common/rc-socket.js',
      format: 'cjs',
      exports: 'named'
    }
  },
  {
    input: 'src/rc-socket.ts',
    external: externals,
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/es/rc-socket.js',
      format: 'es'
    }
  },
  {
    input: 'src/rc-socket.ts',
    plugins: [...sharedPlugins, terser()],
    output: {
      file: 'dist/rc-socket.min.js',
      format: 'umd',
      name: 'RcSocket',
      exports: 'named'
    }
  }
]
