const yaml = require('js-yaml')
const fs = require('fs')
// const path = require('path')

const tags = {}

tags.hex = new yaml.Type('!hex', {
  kind: 'scalar',
  resolve: (x) => (x !== null),
  construct: (x) => {
    x = x.trim().replace(/\s/g, '')
    return Buffer.from(x, 'hex')
  }
})

tags.utf8 = new yaml.Type('!utf8', {
  kind: 'scalar',
  resolve: (x) => (x !== null),
  construct: (x) => {
    // x = x.trim().replace(/\s/g, '')
    return Buffer.from(x, 'utf8')
  }
})

const schema = yaml.Schema.create([
  tags.hex,
  tags.utf8
])

// risk: stdin closed
const s = fs.readFileSync('/dev/stdin', 'utf8')

try {
  // x is array of buffers,
  // terminates early on unrecognized tag
  const x = yaml.load(s, {
    schema,
    listener: (event, state) => {
      if (event === 'close' && state.tag === '?') {
        // lines are zero indexed
        console.error('no tag for element on line', state.line + 1)
        process.exit(1)
      }
    }
  })
  for (let b of x) {
    process.stdout.write(b)
  }
} catch (e) {
  if (e.message) console.error(e.message)
  else console.error(e.stack || String(e))
}
