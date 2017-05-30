Binary analysis and synthesis tool

Install

```
$ npm i -g handcode
```

Synthesize

```
$ hc1 <<-END | hexdump
--- !hc1
- !bin 11111110
- !ui8 237
- !hex fa ce
END
0000000 fe ed fa ce
0000004
```

Analyze

```
$ hc1 d <<< 'the quick brown fox jumped over the lazy dog'
--- !hc1
- !assert-index 0
- !hex 74 68 65 20 71 75 69 63 6b 20 62 72 6f 77 6e 20
- !assert-index 16
- !hex 66 6f 78 20 6a 75 6d 70 65 64 20 6f 76 65 72 20
- !assert-index 32
- !hex 74 68 65 20 6c 61 7a 79 20 64 6f 67 0a
```

See `/examples` for more
