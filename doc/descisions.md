input is a yaml formatted sequence of elements that *must* be tagged with one of the supported tags (hex, utf8, i32 etc).

using yaml is a bit of a hack, it forces an input syntax like

    - !hex ca fe ba be     # end of line comment
    - !hex >
      dead beef c00l d00d

whereas an "ideal" syntax might be more like

    .hex ca fe ba be     # end of line comment
    .hex
      dead beef c00l d00d

but this would require a custom parser, and a bunch of decisions about escaping rules.
punting on those now.

using js-yaml package to parse input stream.
the api doesn't support an observable/stream as input,
so currently we buffer the entire input stream into memory before parsing.
this probably rules out very large (how large?) input files

using undocumented `listener` option of js-yaml to detect untagged (or unrecognized tags) input elements in order to detect errors early and provide the user with a line number

---

ints are default signed (twos compliment encoded), so `i8` means signed and `ui8` means unsigned. i think i'm following an informal convention here

using node `Buffer` class, not interested in browser compatibility right now

---

no support for 64bit ints, JS doesn't have native support so punting for now

---

assert-index directive does not report line number of directive that failed the assertion because this will require extending js-yaml to extract that info

---

binary values look like this

  - !bin |ooxo'xoxo|oooo'oooo|

the goal formatting is to convey "8 bit cells of memory, the x's mark the bits that are set, the quote separates the two nibbles"

---

considered support for octal values and decided to punt
