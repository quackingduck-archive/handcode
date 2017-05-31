/* eslint-disable camelcase */

const indexStr = x => x.toString(10)
const byteStr = x => (((x = x.toString(16)), x.length === 2 ? x : '0' + x))
const bytesStr = xs => Array.from(xs).map(byteStr).join(' ')
const indexLine = x => `- !assert-index ${indexStr(x)}\n`
const hexLine = (xs) => `- !hex ${bytesStr(xs)}\n`

function write_yaml (indexed_slices, out = process.stdout) {
  while (indexed_slices.length) {
    let [index, bytes] = indexed_slices.shift()
    out.write(indexLine(index))
    out.write(hexLine(bytes))
  }
}

function initialize (mem) {
  return (mem && mem._initialized
    ? mem
    : Object.assign({
      slice_len: 16,
      byte_index: 0,
      indexed_slices: [],
      remainder: Buffer.from(''),
      _initialized: true
    }, mem))
}

function step (mem, input) {
  let { slice_len, byte_index, indexed_slices, remainder } = initialize(mem)
  remainder = Buffer.concat([remainder, input])
  let start = 0
  let end = slice_len
  while (end < remainder.length) {
    indexed_slices.push([byte_index, remainder.slice(start, end)])
    byte_index += slice_len; start += slice_len; end += slice_len
  }
  remainder = remainder.slice(start, remainder.length)
  return Object.assign(mem, { slice_len, byte_index, indexed_slices, remainder })
}

function finalize (mem) {
  let { byte_index, indexed_slices, remainder } = initialize(mem)
  indexed_slices.push([byte_index, remainder])
  byte_index += remainder.length
  remainder = Buffer.from('')
  return Object.assign(mem, { byte_index, indexed_slices, remainder })
}

module.exports = {initialize, step, finalize, write_yaml}
