# cli interface

`hc1` (with no args)

invokes the "compiler" which transforms a sequence of text-encoded directives read on stdin to a corresponding binary-encoded byte sequence written to stdout

`hc1 {filename}`

invokes the compiler using the contents of filename as input

`hc1 d {filename}`

dumps the contents of `filename` in a the format the compiler takes as input

`hc1 hd {hex-string}`

invokes the hex "decoder" which represents the bytes given by `hex-string` in a number of different ways (e.g. as utf8 sequence, as 32bit signed int, as a 32bit float, etc) then writes these to representations to stdout using the same format that the compiler takes as input

# yaml-based compiler input format

all values must be tagged

the document must be tagged with `hc1`. more precisely, the first 9 bytes must be `--- !hc1\n`

the value of the document must be a sequence

the value of elements tagged with `hex` must be an even number of hexadecimal characters. whitespace is permitted and ignored

the value of elements tagged with `bin` may be a string of `1` and `0` characters where the total length is divisible by 8. or it may be a string of `x` and `o` characters who's length is must also be divisible by 8. it must not be mixture of those options. the `'`, `|` and `.` chars are all ignored, but the first char may not be `|` (because this already has a special meaning in yaml).

the value of elements tagged with `i8`, `i16`, `i32` must be a signed integer where the twos-compliment binary value fits in 8, 16 and 32 bits respectively

integers may be decimal (e.g. 42), hexadecimal (e.g. 0x2a), or binary (e.g. 0b00101010)

integers may contain spaces (e.g. 0b 0010 1010) or single quote marks (e.g. 0b'0010'1010). both characters are ignored
