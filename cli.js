#!/usr/bin/env node

/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const yaml = require('js-yaml')
const fs = require('fs')
const tag_constructors = require('./tag_constructors')

const st = (n, c) => (
  new yaml.Type(n, {
    kind: 'scalar',
    resolve: (x) => (x !== null),
    construct: c,
  })
)

const sts = Object.keys(tag_constructors).map((name) => {
  const tag_name = name.replace('c_', '!').replace(/_/g, '-')
  return st(tag_name, tag_constructors[name])
})

sts.push(new yaml.Type('!hc', {
  kind: 'sequence',
  resolve: (x) => (x !== null),
  construct: (x) => x,
}))

const schema = yaml.Schema.create(sts)

// ---

// take output and error streams as args?
// throw error if error?
function compile (s) {
  const magic_number = '--- !hc\n'
  if (s.slice(0, magic_number.length) !== magic_number) {
    console.error('error: input must begin with --- !hc')
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

function lpad (s, l, c = '0') {
  while (s.length < l) s = c + s
  return s
}

// 11111110 => 1111'1110
function nibbly_byte_str (s) {
  // return s.replace(/\d{4}/, "$&'")
  return s.replace(/\d{4}/, "$&'")
}

function io_bin (s) {
  return s.replace(/0/g, 'o').replace(/1/g, 'x')
}

function d_bin (b) {
  let a = Array.from(b.values())
  a = a.map((byte) => io_bin(nibbly_byte_str(lpad(byte.toString(2), 8))))
  return '- !bin ' + '|' + a.join('|') + '|'
}

const util = require('util')
const is_valid_utf8 = require('utf-8-validate')

function hex_decode (s) {
  s = s.replace(/\s/g, '')
  let b = Buffer.from(s, 'hex')
  console.log(d_bin(b))
  if (is_valid_utf8(b)) {
    s = '- !utf8 ' + util.inspect(b.toString())
    console.log(s)
  } else {
    console.log('# bytes are not valid utf8')
  }
  if (b.length === 4) { // todo: should be modulo 4
    // little endian
    let i = b.readInt32LE(0).toString()
    let ui = b.readUInt32LE(0).toString()
    console.log('- !i32le ' + i)
    if (i !== ui) console.log('- !ui32le ' + ui)
    // the big end
    i = b.readInt32BE(0).toString()
    ui = b.readUInt32BE(0).toString()
    console.log('- !i32be ' + i)
    if (i !== ui) console.log('- !ui32be ' + ui)
  }
  // todo: floats, more sizes of int
}

module.exports = compile

if (require.main === module) {
  // if stdin is tty then show help instead?
  const a = process.argv[2]
  if (a === 'hd') {
    const b = process.argv[3]
    hex_decode(b)
  } else {
    const input_filename = a || '/dev/stdin'
    const s = fs.readFileSync(input_filename, 'utf8')
    compile(s)
  }
}
