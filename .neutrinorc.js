'use strict'

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
const { fork } = require('child_process')

// 3rd party
const presetLibrary = require('neutrino-preset-library')
const exitHook = require('exit-hook')

/* -----------------------------------------------------------------------------
 * config
 * -------------------------------------------------------------------------- */

module.exports = (neutrino) => {
  neutrino.use(presetLibrary, {
    library: 'RcSocket',
    filename: 'rc-socket.js',
    babel: { plugins: ['babel-plugin-transform-class-properties'] }
  })

  let apiProcess
  neutrino.on('pretest', () => new Promise((resolve, reject) => {
    apiProcess = fork(require.resolve('wss-manager/bin/wss-manager'))
    apiProcess.on('message', msg => msg.connected ? resolve() : reject())
    exitHook(__ => apiProcess.kill('SIGKILL'))
  }))
}
