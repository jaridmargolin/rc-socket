'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const { fork } = require('child_process')

// 3rd party
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
const globals = require('rollup-plugin-node-globals')
const builtins = require('rollup-plugin-node-builtins')
const istanbul = require('rollup-plugin-istanbul')
const exitHook = require('exit-hook')

/* -----------------------------------------------------------------------------
 * karma config
 * -------------------------------------------------------------------------- */

let apiProcess = fork(
  require.resolve('@inventory/wss-manager/dist/bin/wss-manager')
)
exitHook(() => apiProcess.kill('SIGKILL'))

module.exports = config =>
  config.set({
    frameworks: ['mocha'],
    browsers: ['ChromeHeadless'],
    reporters: ['mocha', 'coverage-istanbul'],
    preprocessors: {
      'src/**/*.ts': ['rollup']
    },

    files: [
      {
        pattern: 'src/**/*.test.ts',
        watched: false,
        included: true,
        served: true
      }
    ],

    coverageIstanbulReporter: {
      reports: ['lcov', 'text']
    },

    rollupPreprocessor: {
      onwarn: () => null,
      plugins: [
        json(),
        resolve({
          extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
          preferBuiltins: true,
          mainFields: ['browser', 'module', 'jsnext', 'main']
        }),
        commonjs({
          include: 'node_modules/**',
          namedExports: { chai: ['assert'] }
        }),
        babel({
          extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
          exclude: 'node_modules/**'
        }),
        istanbul({
          exclude: ['src/*.test.ts', 'node_modules/**']
        }),
        globals(),
        builtins()
      ],
      output: {
        format: 'iife',
        name: 'tests'
      }
    }
  })
