`hc1` (with no args) invokes the "compiler"
which transforms a sequence of directives read on stdin
to a corresponding binary written to stdout

`hc1 {filename}` invokes the compiler using the contents of filename as input

`hc1 hd {hex-string}` invokes the hex "decoder"
which interprets the bytes given by hex-string
in a number of different ways (as utf8 sequence, as 32bit int, etc)
and writes these to stdout
