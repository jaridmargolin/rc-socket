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

let apiProcess = fork(require.resolve('wss-manager/bin/wss-manager'))
exitHook(__ => apiProcess.kill('SIGKILL'))

module.exports = config =>
  config.set({
    frameworks: ['mocha'],
    browsers: ['ChromeHeadless'],
    reporters: ['mocha', 'coverage-istanbul'],
    preprocessors: {
      'src/**/*.js': ['rollup'],
      'test/**/*.js': ['rollup']
    },

    files: [
      {
        pattern: 'test/**/*.test.js',
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
          preferBuiltins: true,
          browser: true,
          module: true,
          jsnext: true,
          main: true
        }),
        commonjs({
          include: 'node_modules/**'
        }),
        babel({
          exclude: 'node_modules/**'
        }),
        istanbul({
          exclude: ['test/**', 'node_modules/**']
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
