/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const assert = require('assert')
const constructors = require('./tag_constructors')

function assert_construction (name, s, hs) {
  const f = constructors['c_' + name]
  assert.deepEqual(f(s), new Buffer(hs, 'hex'))
}

assert_construction('hex', 'feedface', 'feedface')
assert_construction('hex', 'feed face', 'feedface')

assert_construction('bin', '1111 1110 1110 1101', 'feed')

assert_construction('utf8', 'hello', '68656c6c6f')
assert_construction('utf8', ' world\n', '20776f726c640a')

assert_construction('i8', '123', '7b')
assert_construction('i8', '1 2\'3', '7b')
assert_construction('i8', '1 2 3, 1', '7b01')

assert_construction('i16le', '255', 'ff00')
assert_construction('i16le', '-2', 'feff')
assert_construction('i16be', '-2', 'fffe')

assert_construction('ui16le', '65534', 'feff')
assert_construction('ui16be', '65534', 'fffe')

assert_construction('i32le', '-2', 'feffffff')
assert_construction('i32be', '-2', 'fffffffe')

assert_construction('ui32le', '65534', 'feff0000')
assert_construction('ui32be', '65534', '0000fffe')

// 64bit ints not yet supported

// float and doubles
assert_construction('f32be', '0.5', '3f000000')
assert_construction('f32le', '0.5', '0000003f')

assert_construction('f64be', '0.5', '3fe0000000000000')

// plain binary bytes
assert_construction('bin', '1111 1110 1110 1101', 'feed')
// Xs and Os can be used
assert_construction('bin', "|xxxx'xxxo|xxxo'xxox|", 'feed')

assert.deepEqual(
  constructors.c_assert_index('0x4'),
  { assert_index: true, value: 4 })

console.log('ok')
