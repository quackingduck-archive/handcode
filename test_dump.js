const { step, finalize } = require('./hex_dump')

const assert = require('assert')
const hb = (s) => Buffer.from(s.replace(/\s/g, ''), 'hex')

// risk: no initialize test
// risk: no write_yaml test

assert.deepEqual(
  step({ slice_len: 2 }, hb('01 02 03 04 05')),
  // expected:
  {
    slice_len: 2,
    byte_index: 4,
    indexed_slices: [
      [0, hb('01 02')],
      [2, hb('03 04')]
    ],
    remainder: hb('05')
  }
)

assert.deepEqual(
  finalize({
    slice_len: 2,
    byte_index: 4,
    remainder: hb('05')
  }),
  // expected:
  {
    slice_len: 2,
    byte_index: 5,
    indexed_slices: [
      [4, hb('05')]
    ],
    remainder: hb('')
  }
)
