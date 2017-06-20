/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const strip = (s) => s.replace(/(\s|')/g, '') // whitespace and ' char
const split = (s) => s.split(',')

// buffer constructors

const xo = (s) => s.toLowerCase().replace(/x/g, '1').replace(/o/g, '0')

const c_bin = (s) => {
  s = xo(strip(s).replace(/[|.]/g, ''))
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

const c_0 = (s) => {
  s = s.replace(/[()]/g, '')
  return Buffer.alloc(Number(s))
}

// support multiple bits?
const c_b = (s) => {
  s = xo(strip(s))
  const n = Number('0b' + s) // risk: could be NaN
  const l = s.length
  return [ l, n ]
}

const c_ui = (s) => {
  const [l, v] = s.match(/\((\d+)\)\s+([^\s]+)/).slice(1)
  return [ Number(l), Number(v) ]
}

const c_length = (s) => {
  const x = s.match(/\((\d+)\)/)
  if (!x || x.length < 2) {
    throw new Error(
      `can't parse length from: ${s}\nexample length value: (16)`)
  }
  return Number(x[1])
}

const _c_bits = (xs, byte_order = 'BE') => {
  // const [len, ...vals] = xs
  let len = 0
  let assert_len
  if (typeof xs[0] === 'number') assert_len = xs.shift()
  if (assert_len && assert_len % 8 !== 0) {
    throw new Error(
      `asserted bitfield length ${assert_len} is not multiple of 8`)
  }
  let ret = 0
  for (let [l, v] of xs) {
    len += l
    ret = ret << l
    ret = ret | v
  }
  if (len === 0) throw new Error(`bitfield length must be greater than zero`)
  if (len % 8 !== 0) {
    throw new Error(`bitfield length ${len} is not multiple of 8`)
  }
  let b = Buffer.alloc(Number(len / 8))
  let fn = 'writeUInt' + len + (len > 8 ? byte_order : '')
  b[fn](ret, 0)
  return b
}

const c_bits_be = (xs) => _c_bits(xs, 'BE')
c_bits_be.kind = 'sequence'
const c_bits_le = (xs) => _c_bits(xs, 'LE')
c_bits_le.kind = 'sequence'

const c_bits = (xs) => c_bits_be(xs)
c_bits.kind = 'sequence'

// off bit
const c_o = () => [1, 0]
c_o.resolve = (x) => x === null
// on bit
const c_x = () => [1, 1]
c_x.resolve = (x) => x === null

// directives

const c_assert_index = (s) => {
  return { assert_index: true, value: Number(strip(s)) }
}

module.exports = {
  c_b,
  c_ui,
  c_o,
  c_x,
  c_length,
  c_len: c_length,
  c_bits,
  c_bits_be,
  c_bits_le,
  c_0,
  c_bin,
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
  c_f32be,
  c_f32le,
  c_f64be,
  c_f64le,
  c_assert_index,
}
