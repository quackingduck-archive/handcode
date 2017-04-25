/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const assert = require('assert')
const constructors = require('./index')

const hb = (x) => new Buffer(x, 'hex')

function assert_construction (name, s, hs) {
  const f = constructors['c_' + name]
  assert.deepEqual(f(s), new Buffer(hs, 'hex'))
}

assert_construction('hex', 'feedface', 'feedface')
assert_construction('hex', 'feed face', 'feedface')

assert_construction('utf8', 'hello', '68656c6c6f')
assert_construction('utf8', ' world\n', '20776f726c640a')

assert_construction('i8', '123', '7b')
assert_construction('i8', '1 2 3', '7b')
assert_construction('i8', '1 2 3, 1', '7b01')

assert_construction('i16le', '255', 'ff00')

console.log('ok')
