/* eslint-disable camelcase */
/* eslint comma-dangle: ["error", "always-multiline"] */

const yaml = require('js-yaml')
const tag_constructors = require('./tag_constructors')

const st = (n, c) => (
  new yaml.Type(n, {
    kind: c.kind || 'scalar',
    resolve: c.resolve || ((x) => (x !== null)),
    construct: c,
  })
)

const doc_tag = '!hc1'

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
function compile (s, out_stream = process.stdout, err_stream = process.stderr) {
  const error = (status, ...msglines) => {
    const e = new Error(msglines.join('\n'))
    e.status = status
    throw e
  }

  try {
    const magic_number = `--- ${doc_tag}\n`
    if (s.slice(0, magic_number.length) !== magic_number) {
      error('bad-doctype', 'Incorrect or missing doctype. First line must be:', magic_number.trim())
    }

    // xs is array of buffers,
    // terminates early on unrecognized tag
    const xs = yaml.load(s, {
      schema,
      listener: (event, state) => {
        if (event === 'close' && state.tag === '?') {
          // lines are zero indexed
          error('missing-tag', `no tag for element on line ${state.line + 1}`)
        }
      },
    })
    let i = 0 // byte index
    // render error if byte index off
    for (let b of xs) {
      if (b.assert_index) {
        if (i !== b.value) {
          error('assert-index-failed', `expected byte index to be: ${b.value} but was ${i}`)
        }
      } else {
        // risk: may not be buffer if bitfield-only tag like !ui used outside of bitfield
        out_stream.write(b)
        i += b.length
      }
    }
  } catch (e) {
    const werror = (str) => err_stream.write(str + '\n')
    if (e.message) {
      werror(e.message)
      return e.status || 'error'
    } else {
      werror((e.stack || String(e)).trim())
      return 'error'
    }
  }
  return 'ok'
}

module.exports = compile
