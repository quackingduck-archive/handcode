#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

find . -path './test_*.js' -exec node {} \;

function test_cli {
  cat > /tmp/hc.yaml
  cmp <(xxd -r -p <<< "$1") <(./cli.js /tmp/hc.yaml)
}

# bitfield - binary values, length asserted
test_cli '6d' <<-HC1
--- !hc1
- !bits
  - !length (8)
  - !b o     # always off in ascii
  - !b xx    # column
  - !b oxxox # row
HC1

# bitfield - off shorthand, unsigned ints, no length asserted
test_cli '6d' <<-HC1
--- !hc1
- !bits
  - !o # always off in ascii
  - !ui (2) 3  # column index (this column has the lower case letters)
  - !ui (5) 13 # row index, 'm' also the 13th letter
HC1

# swap byte order
test_cli '00ff' <<-HC1
--- !hc1
- !bits-le
  - !length (16)
  - !ui (8) 255  # ff
  - !ui (8) 0    # 00
HC1

# hex
test_cli 'cafebabe' <<-HC1
--- !hc1
- !hex cafebabe
HC1

# binary
test_cli 'feedfeed' <<-HC1
--- !hc1
- !bin 1111 1110 1110 1101 # feed
- !bin .|xxxx'xxxo|xxxo'xxox| # feed
HC1

cmp <(./cli.js examples/dns.pcapng.1.yml) examples/dns.pcapng
cmp <(./cli.js examples/macho.o.2.yml) examples/macho.o

echo 'OK'
