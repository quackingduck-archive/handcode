/* eslint-disable camelcase */

function lpad (s, l, c = '0') {
  while (s.length < l) s = c + s
  return s
}

const doc_tag = '!hc1'

// 11111110 => 1111'1110
function nibbly_byte_str (s) {
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
  console.log('--- ' + doc_tag)
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
  if (b.length === 2) { // todo: should be modulo 2
    // little endian
    let i = b.readInt16LE(0).toString()
    let ui = b.readUInt16LE(0).toString()
    console.log('- !i16le ' + i)
    if (i !== ui) console.log('- !ui16le ' + ui)
    // the big end
    i = b.readInt16BE(0).toString()
    ui = b.readUInt16BE(0).toString()
    console.log('- !i16be ' + i)
    if (i !== ui) console.log('- !ui16be ' + ui)
  }
  // todo: floats, more sizes of int
}

module.exports = hex_decode
