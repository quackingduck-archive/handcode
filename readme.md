More than hex editor, less than a programming language, Handcode is you pal in the middle.

```
$ <<< '--- !hc
- !bin 11111110
- !ui8 237
- !hex fa ce' hc | hexdump
0000000 fe ed fa ce
0000004
```

See `/examples` for more
