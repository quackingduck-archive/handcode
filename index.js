#!/usr/bin/env node

/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const yaml = require('js-yaml')
const fs = require('fs')

const without_whitespace = (s) => s.replace(/\s/g, '')
const split = (s) => s.split(',')

// buffer constructors

const c_hex = (s) => {
  return Buffer.from(without_whitespace(s), 'hex')
}

const c_utf8 = (x) => {
  return Buffer.from(x, 'utf8')
}

const c_i8 = (s) => {
  const xs = split(without_whitespace(s))
  const width = 1
  const b = Buffer.allocUnsafe(xs.length * width)
  let i = 0
  for (let x of xs) { b.writeInt8(Number(x), i); i += width }
  return b
}

const c_ui8 = (s) => {
  const xs = split(without_whitespace(s))
  const width = 1
  const b = Buffer.allocUnsafe(xs.length * width)
  let i = 0
  for (let x of xs) { b.writeUInt8(Number(x), i); i += width }
  return b
}

const c_i16le = (s) => {
  const xs = split(without_whitespace(s))
  const width = 2
  const b = Buffer.allocUnsafe(xs.length * width)
  let i = 0
  for (let x of xs) { b.writeInt16LE(Number(x), i); i += width }
  return b
}

const c_i16be = (s) => {
  const xs = split(without_whitespace(s))
  const width = 2
  const b = Buffer.allocUnsafe(xs.length * width)
  let i = 0
  for (let x of xs) { b.writeInt16BE(Number(x), i); i += width }
  return b
}

const c_ui16le = (s) => {
  const xs = split(without_whitespace(s))
  const width = 2
  const b = Buffer.allocUnsafe(xs.length * width)
  let i = 0
  for (let x of xs) { b.writeUInt16LE(Number(x), i); i += width }
  return b
}

const c_ui16be = (s) => {
  const xs = split(without_whitespace(s))
  const width = 2
  const b = Buffer.allocUnsafe(xs.length * width)
  let i = 0
  for (let x of xs) { b.writeUInt16BE(Number(x), i); i += width }
  return b
}

const constructors = {
  c_hex,
  c_utf8,
  c_i8,
  c_i16le,
  c_ui16le,
  c_i16be,
}

Object.assign(module.exports, constructors)

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
  st('!i16le', c_i16le),
  st('!ui16le', c_ui16le),
  st('!i16be', c_i16be),
  st('!ui16be', c_ui16be),
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

if (require.main === module) {
  // risk: stdin might be closed
  const s = fs.readFileSync('/dev/stdin', 'utf8')
  f(s)
}
