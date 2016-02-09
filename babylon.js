'use strict'

const babylon = require('babylon')
const fs = require('fs')

//! Babylon parser for the Enhancer
//
// Options are passed to the Babylon parser.
module.exports = function babylonParser (opts) {
  return parseFile.bind(this, opts)
}

function parseFile (opts, filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, file) => {
      if (err) {
        reject(err)
      } else {
        resolve(babylon.parse(file.toString(), opts).program)
      }
    })
  })
}
