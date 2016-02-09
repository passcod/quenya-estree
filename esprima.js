'use strict'

const esprima = require('esprima')
const fs = require('fs')

//! Esprima parser for the Enhancer
//
// Options are passed to the Esprima parser. `loc` is always set to true.
module.exports = function esprimaParser (opts) {
  opts = opts || {}
  opts.loc = true
  return parseFile.bind(this, opts)
}

function parseFile (opts, filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, file) => {
      if (err) {
        reject(err)
      } else {
        resolve(esprima.parse(file.toString(), opts))
      }
    })
  })
}
