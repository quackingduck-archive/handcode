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

const _c_int = (s, type, byte_width) => {
  const xs = split(without_whitespace(s))
  const b = Buffer.allocUnsafe(xs.length * byte_width)
  let i = 0
  for (let x of xs) { b['write' + type](Number(x), i); i += byte_width }
  return b
}

const c_i8 = (s) => _c_int(s, 'Int8', 1)
const c_ui8 = (s) => _c_int(s, 'UInt8', 1)

const c_i16le = (s) => _c_int(s, 'Int16LE', 2)
const c_i16be = (s) => _c_int(s, 'Int16BE', 2)
const c_ui16le = (s) => _c_int(s, 'UInt16LE', 2)
const c_ui16be = (s) => _c_int(s, 'UInt16BE', 2)

const c_i32le = (s) => _c_int(s, 'Int32LE', 4)
const c_i32be = (s) => _c_int(s, 'Int32BE', 4)
const c_ui32le = (s) => _c_int(s, 'UInt32LE', 4)
const c_ui32be = (s) => _c_int(s, 'UInt32BE', 4)

const constructors = {
  c_hex,
  c_utf8,
  c_i8,
  c_ui8,
  c_i16le,
  c_i16be,
  c_ui16le,
  c_ui16be,
  c_i32le,
  c_i32be,
  c_ui32le,
  c_ui32be,
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

const sts = Object.keys(constructors).map((name) => {
  const tag_name = name.replace('c_', '!')
  return st(tag_name, constructors[name])
})

const schema = yaml.Schema.create(sts)

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
