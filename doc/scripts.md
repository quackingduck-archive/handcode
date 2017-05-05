hand coding/decoding a small pcap file

two arp packets were captured with tcpdump

lets analyze then synthesize the bytestream

```
$ xxd -g1 examples/arp.pcap
00000000: d4 c3 b2 a1 02 00 04 00 00 00 00 00 00 00 00 00  ................
00000010: 00 00 04 00 01 00 00 00 76 79 f6 58 04 93 07 00  ........vy.X....
00000020: 2a 00 00 00 2a 00 00 00 ff ff ff ff ff ff a4 5e  *...*..........^
00000030: 60 df 2e 1b 08 06 00 01 08 00 06 04 00 01 a4 5e  `..............^
00000040: 60 df 2e 1b 0a 00 01 04 00 00 00 00 00 00 0a 00  `...............
00000050: 01 01 76 79 f6 58 c4 9c 07 00 2a 00 00 00 2a 00  ..vy.X....*...*.
00000060: 00 00 a4 5e 60 df 2e 1b d8 30 62 48 b7 00 08 06  ...^`....0bH....
00000070: 00 01 08 00 06 04 00 02 d8 30 62 48 b7 00 0a 00  .........0bH....
00000080: 01 01 a4 5e 60 df 2e 1b 0a 00 01 04              ...^`.......
```

first we copy a hex representation to the clipboard

```
$ xxd -p examples/arp.pcap | pbcopy
```

then we create a the handcode file `arp.pacp.yml` and paste

```
--- !hc
- !hex >
  d4c3b2a102000400000000000000000000000400010000007679f6580493
  07002a0000002a000000ffffffffffffa45e60df2e1b0806000108000604
  0001a45e60df2e1b0a0001040000000000000a0001017679f658c49c0700
  2a0000002a000000a45e60df2e1bd8306248b70008060001080006040002
  d8306248b7000a000101a45e60df2e1b0a000104
```

(experience improvement: handcode should automate this step)

when you run `hc` on this file you will get the same bytes as the original file

```
$ cmp <(hc arp.pacp.yml) examples/arp.pcap
$ # no output means files have no differences
```

now you can do some analysis on the data by adding comments, and changing the representation while maintaining the same binary value

```
---
- !hex d4c3b2a1    # magic number
- !hex 02000400    # major version, minor version
- !hex 00000000    # unused timestamp
- !hex 00000000    # unused timestamp
# ensure we have generated 16 bytes and the next byte index is therefore 16
- !assert-index 16
- !hex >
  00000400010000007679f6580493
  07002a0000002a000000ffffffffffffa45e60df2e1b0806000108000604
  0001a45e60df2e1b0a0001040000000000000a0001017679f658c49c0700
  2a0000002a000000a45e60df2e1bd8306248b70008060001080006040002
  d8306248b7000a000101a45e60df2e1b0a000104
```

you can always check your analysis by resynthesizing the bytestream

```
$ cmp <(hc arp.pacp.yml) examples/arp.pcap
$ # no output means files have no differences
```

---

(up next:)

given the hex representation of a few bytes, decode them a few different ways

```
$ hc hd 'feedface'
# bytes are not valid utf8
- !bin 1111'1110  1110'1101  1111'1010  1100'1110
- !i32le -822415874
- !ui32le 3472551422
- !i32be -17958194
- !ui32be 4277009102
- !f32be -1.5816464369601856e+38
- !f32le -2104950528
```
