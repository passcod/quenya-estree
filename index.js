'use strict'
//! Quenya Babel Enhancer
//
// Takes a Quenya object, uses Babel to parse the js sources, then matches up
// each doc comment context with its corresponding origin and type from the
// AST.
//
// Can be used standalone on an array of objects, or as a Transform on a stream.
//
// # Examples
//
// As a Transform:
//
// ```
// const quenyaBabel = require('quenya-babel').transform
//
// quenya({ files: [...] })
// .pipe(quenyaBabel())
// .on('data', doc => void console.log(doc))
// ```
//
// Standalone:
//
// ```
// const quenyaBabel = require('quenya-babel')
// const quenyaObjects = [...]
// const enhancedObjects = quenyaBabel(quenyaObjects)
// ```

const babel = require('babel-core')
const path = require('path')
const Transform = require('stream').Transform

//! Standalone Quenya Babel enhancer
//
// Takes an array of objects, returns a Promise that resolves to an array of
// enhanced objects. The source and destination are not guaranteed to be in the
// same order.
//
// Only objects with a path having an file extension of `.js`, `.es6`, or
// `.jsx` will be altered, others will be passed on untouched, unless the
// `discard` option is set to `true`.
//
// The `.babelrc` and other standard Babel configuration files are respected,
// if present. Configuration can be passed with the `babel` option, but note
// that some fields *will* be overriden in any case, both for the correct
// functioning of this program and for performance reasons.
module.exports = function quenyaBabel (docs, opts) {
  // In "defaults" mode, we need the output
  opts = Object.assign({
    babel: {},
    errors: false
  }, opts)

  // In "override" mode, the variable is mutated, so we don't
  Object.assign(opts.babel, {
    highlightCode: false,
    sourceMaps: false,
    code: false
  })

  Promise.all(docs
    .filter(checkFileExt)
    .map(doc => transformFile(doc.path, opts.babel))
  )
  .then(asts => void console.log(asts))
}

module.exports.transform = new Transform({
  transform: function quenyaBabelTransform (doc, _, next) {
    //
  }
})

//! Promisified version of babel.transformFile
//
// Returns only the AST, not the rest of the result object
function transformFile (file, opts) {
  return new Promise((resolve, reject) => {
    babel.transformFile(file, opts, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result.ast)
      }
    })
  })
}

//! Checks file extension of a doc's path matches the allowed ones
function checkFileExt (doc) {
  return [
    '.es6',
    '.js',
    '.jsx'
  ].indexOf(path.extname(doc.path)) !== -1
}
