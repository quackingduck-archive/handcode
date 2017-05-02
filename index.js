#!/usr/bin/env node

/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const yaml = require('js-yaml')
const fs = require('fs')

const strip = (s) => s.replace(/(\s|')/g, '') // whitespace and ' char
const split = (s) => s.split(',')

// buffer constructors / assertion handlers

const c_bin = (s) => {
  s = strip(s)
  if (s.length % 8 !== 0) throw new Error('bin values must be byte aligned')
  const b = Buffer.allocUnsafe(s.length / 8)
  for (let i = 0; i < b.length; i++) {
    b.writeUInt8(Number('0b' + s.slice(i * 8, i * 8 + 8)), i)
  }
  return b
}

const c_hex = (s) => {
  return Buffer.from(strip(s), 'hex')
}

const c_utf8 = (x) => {
  return Buffer.from(x, 'utf8')
}

const _c_int = (s, type, byte_width) => {
  const xs = split(strip(s))
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

const c_f32be = (s) => _c_int(s, 'FloatBE', 4)
const c_f32le = (s) => _c_int(s, 'FloatLE', 4)

const c_f64be = (s) => _c_int(s, 'DoubleBE', 8)
const c_f64le = (s) => _c_int(s, 'DoubleLE', 8)

const c_assert_index = (s) => {
  return { assert_index: true, value: Number(strip(s)) }
}

const constructors = {
  // bit strings
  c_bin,
  // byte strings
  c_hex,
  // char strings
  c_utf8,
  // int nums
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
  // float nums
  c_f32be,
  c_f32le,
  c_f64be,
  c_f64le,
  // not constructor
  c_assert_index,
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
  const tag_name = name.replace('c_', '!').replace(/_/g, '-')
  return st(tag_name, constructors[name])
})

const schema = yaml.Schema.create(sts)

function f (s) {
  if (s.slice(0, 4) !== '---\n') {
    console.error('error: input must begin with ---')
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
    let i = 0 // byte index
    // render error if byte index off
    for (let b of xs) {
      if (b.assert_index) {
        if (i !== b.value) {
          console.error(`expected byte index to be: ${b.value} but was ${i}`)
          process.exit(1)
        }
      } else {
        process.stdout.write(b)
        i += b.length
      }
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
