yaml subset

must begin with `---`

example

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

n.b.

* ints
  * can be more than one int
  * negative nums are twos comp
* binary and hex
  * can be more than one byte
  * but no half-bytes allowed
  * spaces ignored
* no booleans, they're not a thing
*
