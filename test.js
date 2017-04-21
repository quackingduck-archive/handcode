const assert = require('assert')
const { c_hex, c_utf8, c_i8 } = require('./index')

const hb = (x) => new Buffer(x, 'hex')

assert.deepEqual(c_hex('feedface'), hb('feedface'))
assert.deepEqual(c_hex('feed face'), hb('feedface'))

assert.deepEqual(c_utf8('hello'), hb('68656c6c6f'))
assert.deepEqual(c_utf8(' world'), hb('20776f726c640a'))

console.log('ok')
