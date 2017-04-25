/* eslint comma-dangle: ["error", "always-multiline"] */

const assert = require('assert')
const {
  c_hex,
  c_utf8,
  c_i8,
  c_i16le,
} = require('./index')

const hb = (x) => new Buffer(x, 'hex')

assert.deepEqual(c_hex('feedface'), hb('feedface'))
assert.deepEqual(c_hex('feed face'), hb('feedface'))

assert.deepEqual(c_utf8('hello'), hb('68656c6c6f'))
assert.deepEqual(c_utf8(' world\n'), hb('20776f726c640a'))

assert.deepEqual(c_i8('123'), hb('7b'))
assert.deepEqual(c_i8('1 2 3'), hb('7b'))
assert.deepEqual(c_i8('1 2 3, 1'), hb('7b01'))

assert.deepEqual(c_i16le('255'), hb('ff00'))

console.log('ok')
