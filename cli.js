#!/usr/bin/env node

/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const yaml = require('js-yaml')
const fs = require('fs')
const tag_constructors = require('./tag_constructors')
const hex_decode = require('./hex_decode')
const dump = require('./dump')

const doc_tag = '!hc1'

const st = (n, c) => (
  new yaml.Type(n, {
    kind: 'scalar',
    resolve: (x) => (x !== null),
    construct: c,
  })
)

const sts = Object.keys(tag_constructors).map((name) => {
  const tag_name = name.replace('c_', '!').replace(/_/g, '-')
  return st(tag_name, tag_constructors[name])
})

sts.push(new yaml.Type(doc_tag, {
  kind: 'sequence',
  resolve: (x) => (x !== null),
  construct: (x) => x,
}))

const schema = yaml.Schema.create(sts)

// ---

// take output and error streams as args?
// throw error if error?
function compile (s) {
  const magic_number = `--- ${doc_tag}\n`
  if (s.slice(0, magic_number.length) !== magic_number) {
    console.error(`error: input must begin with --- ${doc_tag}`)
    process.exit(1)
  }

  try {
    // xs is array of buffers,
    // terminates early on unrecognized tag
    const xs = yaml.load(s, {
      schema,
      listener: (event, state) => {
        if (event === 'close' && state.tag === '?') {
          // lines are zero indexed
          console.error('no tag for element on line', state.line + 1)
          process.exit(1)
        }
      },
    })
    let i = 0 // byte index
    // render error if byte index off
    for (let b of xs) {
      if (b.assert_index) {
        if (i !== b.value) {
          console.error(`expected byte index to be: ${b.value} but was ${i}`)
          process.exit(1)
        }
      } else {
        process.stdout.write(b)
        i += b.length
      }
    }
  } catch (e) {
    if (e.message) console.error(e.message)
    else console.error(e.stack || String(e))
  }
}

module.exports = compile

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
    compile(s)
  }
}
