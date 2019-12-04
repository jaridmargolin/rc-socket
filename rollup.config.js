'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

/* -----------------------------------------------------------------------------
 * rollup config
 * -------------------------------------------------------------------------- */

const sharedPlugins = [
  resolve({
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
    module: true
  }),
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
    external: ['task-queue.js'],
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/common/rc-socket.js',
      format: 'cjs',
      exports: 'named'
    }
  },
  {
    input: 'src/rc-socket.ts',
    external: ['task-queue.js'],
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
