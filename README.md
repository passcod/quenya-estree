# Quenya ESTree Enhancer

Uses an [ESTree]-compatible parser to enhance [Quenya] doc objects with the JS
AST node their context points to.

```
npm install quenya-estree
```

## Usage

```js
const quenyaESTree = require('quenya-estree')

quenyaESTree([quenya objects...], options)
.catch(err => void console.error(err))
.then(docs => {
  docs.forEach(doc => void console.log(doc))
  // ...
})
```

### Options

- `discard` (boolean, defaults to `false`): If `true`, return only objects for
  which an AST node was found; if `false`, pass-through all others too.

- `parser` (function, required): Will be passed a path, should return a Promise
  that resolves to the AST or an error.

- `filter` (function, defaults to checking the extension matches `.js` and the
  doc has a non-null `context`): Will be passed a path, should return truthy if
  the described file should be parsed and falsy otherwise.

### Parsers

There are five already-Promisified parsers available (but of course you may
plug in your own):

- [Acorn]: `require('quenya-estree/acorn')(acorn options)`
- [Babel]: `require('quenya-estree/babel')(babel-core options)`
- [Babylon]: `require('quenya-estree/babylon')(babylon options)`
- [Espree]: `require('quenya-estree/espree')(espree options)`
- [Esprima]: `require('quenya-estree/esprima')(esprima options)`

[Acorn]: https://www.npmjs.com/package/acorn
[Babel]: https://www.npmjs.com/package/babel-core
[Babylon]: https://www.npmjs.com/package/babylon
[Espree]: https://www.npmjs.com/package/espree
[Esprima]: https://www.npmjs.com/package/esprima
[ESTree]: https://github.com/estree/estree
[Quenya]: https://www.npmjs.com/package/quenya
