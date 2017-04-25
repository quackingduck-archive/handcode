yaml subset

must begin with `---`

example:
```
---
- !!hex c001 d00d
- !!bits 0111 1111
- !!utf8 unquoted
- !!utf8 quoted
- !!utf8 >
  multi
  line
- !!i8 -1
- !!i16 -1
- !!i32 -1
- !!i64 -1
- !!ui8 1 2 3 4
- !!f32 -1.1
```

no booleans. they're too high-level for this
