a "language" for precisely (i.e. "by hand") laying out arbitrary byte sequences

a program that "assembles" a byte sequence (binary data) from input text file

if you've found use for a hex editor in the past, you may find a use for this in the future

  $ <<< $'---\n- !hex feedface' node index.js | xxd
  00000000: feed face                                ....
