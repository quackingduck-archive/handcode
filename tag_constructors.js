/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const strip = (s) => s.replace(/(\s|')/g, '') // whitespace and ' char
const split = (s) => s.split(',')

// buffer constructors

const xo = (s) => s.toLowerCase().replace(/x/g, '1').replace(/o/g, '0')

const c_bin = (s) => {
  s = xo(strip(s).replace(/\|/g, ''))
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

const c_0 = (s) => Buffer.alloc(Number(s))

// directives

const c_assert_index = (s) => {
  return { assert_index: true, value: Number(strip(s)) }
}

module.exports = {
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
