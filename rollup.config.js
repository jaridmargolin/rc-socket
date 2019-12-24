'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
import { join } from 'path'
import { readdir } from 'fs'
import { promisify } from 'util'

// 3rd party
import pkgDir from 'pkg-dir'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'

// promisify
const readdirP = promisify(readdir)

/* -----------------------------------------------------------------------------
 * rollup config
 * -------------------------------------------------------------------------- */

const getExternals = async () => {
  const corejsDir = await pkgDir(require.resolve('core-js'))
  const files = await readdirP(join(corejsDir, 'modules'))

  return files
    .map(file => join('core-js', 'modules', file).replace('.js', ''))
    .concat(['event-target-shim'])
}

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

export default async () => [
  {
    input: 'src/rc-socket.ts',
    external: await getExternals(),
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/common/rc-socket.js',
      format: 'cjs',
      exports: 'named'
    }
  },
  {
    input: 'src/rc-socket.ts',
    external: await getExternals(),
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
  },
  {
    input: 'src/rc-socket.ts',
    plugins: [...sharedPlugins],
    output: {
      file: 'dist/rc-socket.js',
      format: 'umd',
      name: 'RcSocket',
      exports: 'named'
    }
  }
]
