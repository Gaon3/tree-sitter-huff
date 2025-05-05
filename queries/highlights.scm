(identifier) @variable

(preprocessor) @keyword.directive
[
  "#include"
  "#define"
] @keyword.directive

[
  "takes"
  "returns"
  "memory"
  "calldata"
] @keyword

[
  "macro"
  "fn"
  "event"
  "function"
  "constant"
  "table"
] @type

(opcode) @operator

(solidity_modifier) @keyword.modifier

(macro_definition name: (macro_name) @function)
(macro_call name: (macro_name) @function)

(constant_definition name: (constant_name) @constant)
(constant_reference name: (constant_name) @constant)

(table_definition name: (constant_name) @constant)

(jump_label_definition name: (macro_name) @label)
(jump_label_reference name: (macro_name) @label)


; Literals
(string) @string
[
  (number)
  (hex_literal)
] @number

; Identifiers

; Punctuation
[
  "{"
  "}"
  "("
  ")"
  "<"
  ">"
] @punctuation.delimiter

[
  ":"
  ","
  "="
] @punctuation

(comment) @comment
