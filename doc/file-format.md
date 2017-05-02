first 4 bytes must be `---\n` (this is a reserved extension point)

a flat list of tokens (type + lexeme) encoded with a subset of yaml

example:
```
---
- !!hex c001 d00d
- !!bin 0111 1111
- !!utf8 unquoted
- !!utf8 "quoted"
- !!utf8 >
  multi
  line
- !!i8 -1
- !!i16le -1
- !!f32le -1.1
```

(see `/examples` for more)

no boolean type, because what's truth really?
