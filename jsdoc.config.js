'use strict'

/* -----------------------------------------------------------------------------
 * jsdoc config
 * -------------------------------------------------------------------------- */

module.exports = {
  opts: {
    destination: './docs',
    readme: './README.md',
    template: './node_modules/docdash'
  },
  source: {
    include: './src'
  },
  templates: {
    default: {
      includeDate: false
    }
  }
}
