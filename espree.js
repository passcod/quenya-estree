'use strict'

const espree = require('espree')
const fs = require('fs')

//! Espree parser for the Enhancer
//
// Options are passed to the Espree parser. `loc` is always set to true.
module.exports = function espreeParser (opts) {
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
        resolve(espree.parse(file.toString(), opts))
      }
    })
  })
}
