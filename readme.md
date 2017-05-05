More than hex editor, less than a programming language, Handcode is your pal in the middle.

```
$ npm install -g handcode
$ <<< '--- !hc
- !bin 11111110
- !ui8 237
- !hex fa ce' hc | hexdump
0000000 fe ed fa ce
0000004
```

See `/examples` for more
