#!/usr/bin/env node

/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const fs = require('fs')
const hex_decode = require('./hex_decode')
const dump = require('./dump')
const compile = require('./compile')

const doc_tag = '!hc1'

if (require.main === module) {
  // if stdin is tty then show help instead?
  const a = process.argv[2]
  if (a === 'hd') {
    // hex decode
    const b = process.argv[3]
    hex_decode(b)
  } else if (a === 'd') {
    // dump
    const b = process.argv[3] || '/dev/stdin'
    const out = process.stdout
    const rs = fs.createReadStream(b)
    let mem = dump.initialize()
    out.write(`--- ${doc_tag}\n`)
    rs.on('data', (b) => { mem = dump.step(mem, b); dump.write_yaml(mem.indexed_slices, out) })
    rs.on('end', () => { dump.finalize(mem); dump.write_yaml(mem.indexed_slices, out) })
  } else {
    // compile
    const input_filename = a || '/dev/stdin'
    const s = fs.readFileSync(input_filename, 'utf8')
    const status = compile(s, process.stdout, process.stderr)
    if (status !== 'ok') process.exit(1)
  }
}
