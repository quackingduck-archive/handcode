#!/usr/bin/env node

const yaml = require('js-yaml')
const fs = require('fs')
// const path = require('path')

const tags = {}

tags.hex = new yaml.Type('!hex', {
  kind: 'scalar',
  resolve: (x) => (x !== null),
  construct: (x) => {
    x = x.trim().replace(/\s/g, '')
    return Buffer.from(x, 'hex')
  }
})

tags.utf8 = new yaml.Type('!utf8', {
  kind: 'scalar',
  resolve: (x) => (x !== null),
  construct: (x) => {
    return Buffer.from(x, 'utf8')
  }
})

tags.i8 = new yaml.Type('!i8', {
  kind: 'scalar',
  resolve: (x) => (x !== null),
  construct: (x) => {
    const b = Buffer.allocUnsafe(1)
    // todo: validate? how would we propegate the error back to the error handling code?
    // todo: support binary notation
    b.writeInt8(parseInt(x, 10), 0)
    return b
  }
})

const schema = yaml.Schema.create([
  tags.hex,
  tags.utf8,
  tags.i8
])

// risk: stdin closed
const s = fs.readFileSync('/dev/stdin', 'utf8')

if (s.slice(0, 4) !== '---\n') {
  console.error('source file must begin with ---')
  process.exit(1)
}

try {
  // x is array of buffers,
  // terminates early on unrecognized tag
  const x = yaml.load(s, {
    schema,
    listener: (event, state) => {
      if (event === 'close' && state.tag === '?') {
        // lines are zero indexed
        console.error('no tag for element on line', state.line + 1)
        process.exit(1)
      }
    }
  })
  for (let b of x) {
    process.stdout.write(b)
  }
} catch (e) {
  if (e.message) console.error(e.message)
  else console.error(e.stack || String(e))
}
