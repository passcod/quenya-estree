'use strict'
//! Quenya ESTree Enhancer
//
// Takes Quenya objects, uses *any [ESTree]-compatible parser* (that produces
// `{ line: 1, column: 0}` position information) to parse the js sources, then
// matches up each doc comment context with its corresponding AST node.
//
// Can be used standalone on an array of objects, or as a Transform on a
// stream.
//
// *Obviously* if the Quenya objects and the source files have gotten out of
// sync, you'll get all sorts of trouble, so don't do that. There's no sanity
// checking, we basically take the `contextLine` and `path` fields as gospel
// and if things don't match up the program will respond with wrongness.
//
// Adds a `node` field to the objects.

const memoize = require('lodash.memoize')
const path = require('path')
const Transform = require('stream').Transform

//! Applies the Enhancer to an array of objects
//
// Takes an array of objects, returns a Promise that resolves to an array of
// enhanced objects. The source and destination are not guaranteed to be in the
// same order.
//
// # Options
//
// - `discard` (boolean, defaults to `false`): If `true`, return only objects
//   for which an AST node was found; if `false`, pass-through all others too.
// - `parser` (function, required): Will be passed a path, should return a
//   Promise that resolves to the AST or an error.
// - `filter` (function, defaults to checking the extension matches `.js`):
//   Will be passed a path, should return truthy if the described file should
//   be parsed and falsy otherwise.
//
// # Examples
//
// ```
// const quenyaESTree = require('quenya-estree')
//
// quenyaESTree([...], options)
// .catch(err => void console.error(err))
// .then(docs => {
//   docs.forEach(doc => void console.log(doc))
//   // ...
// })
// ```
module.exports = function quenyaESTree (docs, opts) {
  // In "defaults" mode, we need the output
  opts = Object.assign({
    discard: false,
    filter: function (doc) {
      return (doc.context !== null) && (path.extname(doc.path) === '.js')
    }
  }, opts)

  if (typeof opts.parser !== 'function' || opts.parser.length !== 1) {
    return Promise.reject('Parser function not provided or with wrong arity!')
  }

  // We don't want to parse a file twice, for performance
  opts.parser = memoize(opts.parser)

  // Nor filter a doc twice, on the odd chance there are duplicates
  opts.filter = memoize(opts.filter)

  const parseDocs = []
  const otherDocs = []
  docs.forEach(doc => {
    (opts.filter(doc) ? parseDocs : otherDocs).push(doc)
  })

  return Promise.all(
    parseDocs.map(doc => (
      opts.parser(doc.path, opts.babel)
      .then(ast => matchNodesToDoc(ast, doc))
    ))
  ).then(docs => {
    if (opts.discard) {
      docs = docs.filter(doc => doc.node)
    } else {
      [].push.apply(docs, otherDocs)
    }

    return docs
  })
}

//! Applies the Enhancer to every object in a stream
//
// Options are as for the `quenyaESTree()` function.
//
// # Examples
//
// ```
// const quenyaESTree = require('quenya-estree').transform
//
// quenya({ files: [...] })
// .pipe(quenyaESTree(options))
// .on('data', doc => void console.log(doc))
// ```
module.exports.transform = new Transform({
  transform: function quenyaESTreeTransform (doc, _, next) {
    //
  }
})

//! Looks through an AST for nodes matching the line number of associated doc
//
// If there's a match, attach it to the `node` field. Otherwise, passthru.
function matchNodesToDoc (ast, doc) {
  function matchSubTree (tree, line) {
    const match = tree.body.filter(
      node => node.loc.start.line <= line
    )

    const last = match.pop()
    let prior = match.pop()

    if (last) {
      if (last.loc.start.line === line) {
        return last
      }

      // In some cases (first doc comment is not at top-level), last doesn't
      // match but prior doesn't exist
      prior = prior || last

      if (prior.body) {
        // Gotta dig deeper
        return matchSubTree(prior.body, line)
      }
    }
  }

  const match = matchSubTree(ast, doc.contextLine)
  if (match) {
    doc.node = match
  }

  return doc
}
