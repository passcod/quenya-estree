#!/usr/bin/env node
'use strict'
const parser = process.argv[2]

const objs = []
require('quenya')({
  files: process.argv.slice(3)
})
.on('data', obj => {
  console.log('push')
  objs.push(obj)
})

setTimeout(() => {
  console.log('end')
  require('.')(objs, { parser: require(`./${parser}`)() })
  .then(docs => void console.log(docs))
  .catch(err => void console.error(err))
}, 500)
