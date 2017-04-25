#!/usr/bin/env node

/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const yaml = require('js-yaml')
const fs = require('fs')

// buffer constructors

const c_hex = (x) => {
  x = x.trim().replace(/\s/g, '')
  // todo: error if not hex digits, or not byte aligned
  return Buffer.from(x, 'hex')
}

const c_utf8 = (x) => {
  return Buffer.from(x, 'utf8')
}

const c_i8 = (x) => {
  x = x.replace(/\s/g, '')
  const xs = x.split(',')
  const b = Buffer.allocUnsafe(xs.length)
  let i = 0
  for (x of xs) b.writeInt8(Number(x), i++)
  return b
}

const c_ui8 = (x) => {
  x = x.replace(/\s/g, '')
  const xs = x.split(',')
  const b = Buffer.allocUnsafe(xs.length)
  let i = 0
  for (x of xs) b.writeUInt8(Number(x), i++)
  return b
}

// make schema tag
const st = (n, c) => (
  new yaml.Type(n, {
    kind: 'scalar',
    resolve: (x) => (x !== null),
    construct: c,
  })
)

const schema = yaml.Schema.create([
  st('!hex', c_hex),
  st('!utf8', c_utf8),
  st('!i8', c_i8),
  st('!ui8', c_ui8),
])

function f (s) {
  if (s.slice(0, 4) !== '---\n') {
    console.error('input must begin with ---')
    process.exit(1)
  }

  try {
    // xs is array of buffers,
    // terminates early on unrecognized tag
    const xs = yaml.load(s, {
      schema,
      listener: (event, state) => {
        if (event === 'close' && state.tag === '?') {
          // lines are zero indexed
          console.error('no tag for element on line', state.line + 1)
          process.exit(1)
        }
      },
    })
    for (let b of xs) {
      process.stdout.write(b)
    }
  } catch (e) {
    if (e.message) console.error(e.message)
    else console.error(e.stack || String(e))
  }
}

module.exports = {
  c_hex,
  c_utf8,
  c_i8,
}

if (require.main === module) {
  // risk: stdin might be closed
  const s = fs.readFileSync('/dev/stdin', 'utf8')
  f(s)
}
