'use strict'

const acorn = require('acorn')
const fs = require('fs')

//! Acorn parser for the Enhancer
//
// Options are passed to the Acorn parser. `locations` is always set to true.
module.exports = function acornParser (opts) {
  opts = opts || {}
  opts.locations = true
  return parseFile.bind(this, opts)
}

function parseFile (opts, filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, file) => {
      if (err) {
        reject(err)
      } else {
        resolve(acorn.parse(file.toString(), opts))
      }
    })
  })
}
