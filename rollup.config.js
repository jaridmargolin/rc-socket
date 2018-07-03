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
  resolve({ module: true }),
  babel({
    exclude: 'node_modules/**'
  })
]

export default [
  {
    input: 'src/rc-socket.js',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/rc-socket.js',
      format: 'umd',
      name: 'RcSocket'
    }
  },
  {
    input: 'src/rc-socket.js',
    external: ['task-queue.js'],
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/common/rc-socket.js',
      format: 'cjs'
    }
  },
  {
    input: 'src/rc-socket.js',
    external: ['task-queue.js'],
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/es/rc-socket.js',
      format: 'es'
    }
  },
  {
    input: 'src/rc-socket.js',
    plugins: [...sharedPlugins, terser()],
    output: {
      file: 'dist/rc-socket.min.js',
      format: 'umd',
      name: 'RcSocket'
    }
  }
]
