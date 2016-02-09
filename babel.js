'use strict'

const babel = require('babel-core')

//! Babel parser for the Enhancer
//
// Options are passed to the Babel parser. Some are overriden so the parser
// can work properly for the Enhancer. By default Babel will look for a
// `.babelrc` or other standard config file for options.
module.exports = function babelParser (opts) {
  opts = opts || {}
  Object.assign(opts, {
    ast: true,
    code: false,
    highlightCode: false,
    sourceMaps: false
  })

  return transformFile.bind(this, opts)
}

//! Promisified version of babel.transformFile
function transformFile (opts, filename) {
  return new Promise((resolve, reject) => {
    babel.transformFile(filename, opts, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result.ast.program)
      }
    })
  })
}
