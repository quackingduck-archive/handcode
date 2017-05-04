Hand write arbitrary binary data.

When you need to get so low-level that you are precisely placing every bit in a byte stream, `hc` can help.

  $ <<< $'---\n- !bin 11111110 11101101 11111010 11001110' node index.js | xxd
  00000000: feed face                                ....

See `/examples` for some example source files.

If find yourself needing something more sophisticated you might want to try nasm[1] ... or any high-level programming language that supports explicit binary values.

[1]:http://www.nasm.us/
